"""
Lambda function to get a service by ID
"""
import os
import json
from botocore.exceptions import ClientError

# Import utility functions
from utils.db_utils import get_item_by_id, generate_response
from utils.responser_helper import handle_exception

def lambda_handler(event, context):
    """
    Handle Lambda event for GET /services/{id}
    
    Args:
        event (dict): Lambda event
        context (LambdaContext): Lambda context
        
    Returns:
        dict: API Gateway response
    """
    print(f"Received event: {json.dumps(event)}")
    
    table_name = os.environ.get('SERVICES_TABLE')
    if not table_name:
        return generate_response(500, {'message': 'Services table name not configured'})
    
    # Get service ID from path parameters
    service_id = event.get('pathParameters', {}).get('id')
    if not service_id:
        return generate_response(400, {'message': 'Missing service ID'})
    
    try:
        # Get service by ID
        service = get_item_by_id(table_name, service_id)
        
        if not service:
            return generate_response(404, {'message': f'Service with ID {service_id} not found'})
        
        return generate_response(200, service)
    
    except ClientError as e:
        return handle_exception(e)
    except Exception as e:
        print(f"Error fetching service: {e}")
        return generate_response(500, {
            'message': 'Error fetching service',
            'error': str(e)
        })