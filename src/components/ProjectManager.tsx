// Update the handleCreateReport function in ProjectManager.tsx:

const handleCreateReport = async () => {
  if (newReportName.trim()) {
    try {
      const projectId = await createProject(newReportName);
      // Store the report name for calendar sync
      localStorage.setItem('currentReportName', newReportName);
      onProjectChange(projectId);
      setNewReportName('');
      setShowNewReportDialog(false);
    } catch (error) {
      console.error('Failed to create report:', error);
      alert('Failed to create report. Please try again.');
    }
  }
};