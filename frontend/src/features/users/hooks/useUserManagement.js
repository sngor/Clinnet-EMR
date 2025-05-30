// src/features/users/hooks/useUserManagement.js
import { useState, useCallback } from 'react';
import adminService from '../../../services/adminService';
import { transformUsersForFrontend } from '../../../utils/user-transformers';

/**
 * Custom hook for user management operations
 * @returns {Object} User management methods and state
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    nextToken: null,
    hasMore: false
  });

  /**
   * Fetch users from Cognito
   * @param {Object} options - Pagination options
   */
  const fetchUsers = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminService.listUsers({
        limit: options.limit || 60,
        nextToken: options.nextToken || pagination.nextToken
      });
      
      // Transform users to ensure profile images are properly handled
      const transformedUsers = transformUsersForFrontend(result.users);
      
      if (options.append) {
        setUsers(prev => [...prev, ...transformedUsers]);
      } else {
        setUsers(transformedUsers);
      }
      
      setPagination({
        nextToken: result.nextToken,
        hasMore: !!result.nextToken
      });
      
      return result;
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pagination.nextToken]);

  /**
   * Create a new user
   * @param {Object} userData - User data
   */
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await adminService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing user
   * @param {string} userId - User ID to update
   * @param {Object} userData - User data
   */
  const updateUser = async (userId, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await adminService.updateUser(userId, userData);
      setUsers(prev => 
        prev.map(user => 
          (user.id === userId || user.sub === userId || user.uniqueId === userId) ? updatedUser : user
        )
      );
      return updatedUser;
    } catch (err) {
      setError(err.message || "Failed to update user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a user
   * @param {string} userId - User ID to delete
   */
  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId && user.sub !== userId && user.uniqueId !== userId));
      return { success: true };
    } catch (err) {
      setError(err.message || "Failed to delete user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enable a user
   * @param {string} userId - User ID to enable
   */
  const enableUser = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      await adminService.enableUser(userId);
      setUsers(prev => 
        prev.map(user => 
          (user.id === userId || user.sub === userId || user.uniqueId === userId) ? { ...user, enabled: true } : user
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message || "Failed to enable user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable a user
   * @param {string} userId - User ID to disable
   */
  const disableUser = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      await adminService.disableUser(userId);
      setUsers(prev => 
        prev.map(user => 
          (user.id === userId || user.sub === userId || user.uniqueId === userId) ? { ...user, enabled: false } : user
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message || "Failed to disable user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load more users (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || !pagination.nextToken) return;
    
    return fetchUsers({
      nextToken: pagination.nextToken,
      append: true
    });
  }, [fetchUsers, pagination.hasMore, pagination.nextToken]);

  /**
   * Refresh the user list
   */
  const refreshUsers = useCallback(() => {
    return fetchUsers({ nextToken: null });
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
    loadMore,
    refreshUsers
  };
};

export default useUserManagement;