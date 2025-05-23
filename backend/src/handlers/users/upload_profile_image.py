"""
Lambda function to upload a user profile image to S3 and update the user's profile.
"""
import os
import json
import boto3
import base64
import uuid
import logging
from botocore.exceptions import ClientError

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def build_error_response(status_code, error_type, message):
    """
    Build a standardized error response
    
    Args:
        status_code (int): HTTP status code
        error_type (str): Type of error
        message (str): Error message
        
    Returns:
        dict: API Gateway response with error details
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': 'https://d23hk32py5djal.cloudfront.net',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
        },
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }

def handle_exception(exception):
    """
    Handle exceptions and return appropriate responses
    
    Args:
        exception: The exception to handle
        
    Returns:
        dict: API Gateway response with error details
    """
    if isinstance(exception, ClientError):
        error_code = exception.response.get('Error', {}).get('Code', 'UnknownError')
        
        if error_code == 'ResourceNotFoundException':
            return build_error_response(404, 'Not Found', str(exception))
        elif error_code == 'ValidationException':
            return build_error_response(400, 'Validation Error', str(exception))
        elif error_code == 'AccessDeniedException':
            return build_error_response(403, 'Access Denied', str(exception))
        else:
            logger.error(f"AWS ClientError: {error_code} - {str(exception)}")
            return build_error_response(500, 'AWS Error', str(exception))
    else:
        logger.error(f"Unexpected error: {str(exception)}")
        return build_error_response(500, 'Internal Server Error', str(exception))

def lambda_handler(event, context):
    """
    Handle Lambda event for POST /users/profile-image (Uploads a profile image)
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    logger.info(f"Received event: {json.dumps(event)}")
    logger.info(f"Event body: {event.get('body')}")
    
    try:
        # Parse request body
        if not event.get('body'):
            return build_error_response(400, 'Bad Request', 'Request body is required')
        
        request_body = json.loads(event['body'])
        
        # Extract username from request context (from Cognito authorizer)
        try:
            username = event['requestContext']['authorizer']['claims']['email']
            logger.info(f"Processing profile image upload for user: {username}")
        except (KeyError, TypeError):
            logger.error("Could not extract username from request context")
            return build_error_response(401, 'Unauthorized', 'User identity not found in request')
        
        # Validate required fields
        if not request_body.get('image'):
            return build_error_response(400, 'Bad Request', 'Image data is required')
        
        # Extract image data
        image_data = request_body.get('image')
        
        # Check if the image is base64 encoded
        if not image_data.startswith('data:image/'):
            return build_error_response(400, 'Bad Request', 'Invalid image format. Must be base64 encoded with MIME type')
        
        # Extract the MIME type and base64 data
        try:
            mime_type = image_data.split(';')[0].split(':')[1]
            base64_data = image_data.split(',')[1]
            
            # Determine file extension from MIME type
            extension_map = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp'
            }
            
            extension = extension_map.get(mime_type, 'jpg')
            
            # Decode base64 data
            decoded_image = base64.b64decode(base64_data)
        except Exception as e:
            logger.error(f"Error processing image data: {e}")
            return build_error_response(400, 'Bad Request', 'Invalid image data format')
        
        # Generate a unique filename
        filename = f"profile-images/{username}/{str(uuid.uuid4())}.{extension}"
        
        # Get S3 bucket name from environment variable
        bucket_name = os.environ.get('DOCUMENTS_BUCKET')
        if not bucket_name:
            logger.error("Environment variable DOCUMENTS_BUCKET not set")
            return build_error_response(500, 'Configuration Error', 'Document storage not configured')
        
        # Initialize S3 client
        s3 = boto3.client('s3')
        
        # Upload the image to S3
        logger.info(f"Uploading image to S3: {bucket_name}/{filename}")
        s3.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=decoded_image,
            ContentType=mime_type
        )
        
        # Generate a pre-signed URL for the uploaded image
        image_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': filename},
            ExpiresIn=3600  # URL valid for 1 hour
        )
        
        # Update user profile with the image URL
        # Initialize Cognito client
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            logger.error("Environment variable USER_POOL_ID not set")
            return build_error_response(500, 'Configuration Error', 'User pool ID not configured')
        
        cognito = boto3.client('cognito-idp')
        
        # Update user attributes with the profile image URL
        # We'll use a custom attribute 'custom:profile_image' to store the image key
        cognito.admin_update_user_attributes(
            UserPoolId=user_pool_id,
            Username=username,
            UserAttributes=[
                {
                    'Name': 'custom:profile_image',
                    'Value': filename
                }
            ]
        )
        
        # Return success response with the image URL
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': 'https://d23hk32py5djal.cloudfront.net',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Profile image uploaded successfully',
                'imageUrl': image_url,
                'imageKey': filename
            })
        }
        
        logger.info(f"Profile image uploaded successfully for user: {username}")
        return response
    
    except ClientError as ce:
        logger.error(f"AWS ClientError uploading profile image: {ce}")
        return handle_exception(ce)
    except Exception as e:
        logger.error(f"Unexpected error uploading profile image: {e}", exc_info=True)
        return handle_exception(e)