'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchWorkoutTemplates,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
} from '@/actions/workout-templates';
import { WorkoutTemplate } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import ColorSelector from '@/components/ColorSelector';
import { DEFAULT_COLOR_ID, getColorPillClasses } from '@/lib/utils/colors';

const TemplatesPage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);

  const [showNewTemplateInput, setShowNewTemplateInput] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateColor, setNewTemplateColor] = useState(DEFAULT_COLOR_ID);
  const [isCreating, setIsCreating] = useState(false);

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkoutTemplates();

    if (error) {
      showAlert('Error Loading Templates', error, 'error');
      setLoading(false);
      return;
    }

    setTemplates(data || []);
    setLoading(false);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      showAlert('Invalid Name', 'Please enter a template name', 'warning');
      return;
    }

    setIsCreating(true);
    const { data, error } = await createWorkoutTemplate(newTemplateName.trim(), newTemplateColor);

    if (error) {
      showAlert('Error Creating Template', error, 'error');
      setIsCreating(false);
      return;
    }

    // Navigate to the new template detail page
    if (data) {
      router.push(`/templates/${data.id}`);
    }
  };

  const handleDeleteClick = (template: WorkoutTemplate) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    const { success, error } = await deleteWorkoutTemplate(templateToDelete.id);

    if (error) {
      showAlert('Error Deleting Template', error, 'error');
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
      return;
    }

    // Refresh the list
    await loadTemplates();
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
    showAlert('Template Deleted', 'The template has been deleted successfully', 'success');
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  // Filter templates by search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workout Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage reusable workout templates
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* New Template Button/Input */}
        {!showNewTemplateInput ? (
          <button
            onClick={() => setShowNewTemplateInput(true)}
            className="w-full mb-6 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Template
          </button>
        ) : (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
            <input
              type="text"
              placeholder="Template name..."
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isCreating) {
                  handleCreateTemplate();
                }
              }}
              className="w-full px-4 py-2 mb-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="mb-3">
              <ColorSelector
                selectedColorId={newTemplateColor}
                onColorChange={setNewTemplateColor}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTemplate}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold cursor-pointer transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowNewTemplateInput(false);
                  setNewTemplateName('');
                  setNewTemplateColor(DEFAULT_COLOR_ID);
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading templates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No templates found matching your search' : 'No templates yet'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Create your first template to get started
              </p>
            )}
          </div>
        )}

        {/* Templates List */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getColorPillClasses(template.color)}`}
                      aria-label={`Template color: ${template.color || 'green'}`}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Created {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModalOpen}
        title={alertModalContent.title}
        message={alertModalContent.message}
        type={alertModalContent.type}
        onClose={() => setAlertModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />
    </div>
  );
};

export default TemplatesPage;
