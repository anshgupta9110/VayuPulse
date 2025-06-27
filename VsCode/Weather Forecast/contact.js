// Contact Page JavaScript
let complaints = JSON.parse(localStorage.getItem('complaints')) || [];

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alertBox');
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type}`;
  alertBox.style.display = 'block';
  
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 5000);
}

// Reset form
function resetForm() {
  document.getElementById('complaintForm').reset();
  showAlert('Form has been reset.', 'info');
}

// Add new complaint
function addComplaint(complaintData) {
  const complaint = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...complaintData
  };
  
  complaints.unshift(complaint); // Add to beginning of array
  localStorage.setItem('complaints', JSON.stringify(complaints));
  
  displayComplaints();
  updateStats();
}

// Display complaints
function displayComplaints() {
  const complaintsList = document.getElementById('complaintsList');
  const filterSeverity = document.getElementById('filterSeverity').value;
  const filterType = document.getElementById('filterType').value;
  
  let filteredComplaints = complaints;
  
  // Apply filters
  if (filterSeverity !== 'all') {
    filteredComplaints = filteredComplaints.filter(complaint => complaint.severity === filterSeverity);
  }
  
  if (filterType !== 'all') {
    filteredComplaints = filteredComplaints.filter(complaint => complaint.complaintType === filterType);
  }
  
  if (filteredComplaints.length === 0) {
    complaintsList.innerHTML = `
      <div class="no-complaints">
        <div class="no-complaints-icon">📝</div>
        <h3>No Complaints Found</h3>
        <p>No complaints match your current filters</p>
      </div>
    `;
    return;
  }
  
  complaintsList.innerHTML = filteredComplaints.map(complaint => `
    <div class="complaint-item ${complaint.severity}" onclick="viewComplaint(${complaint.id})">
      <div class="complaint-header">
        <h4 class="complaint-title">${complaint.subject}</h4>
        <span class="complaint-severity">${complaint.severity}</span>
      </div>
      
      <div class="complaint-meta">
        <span class="complaint-type">${getComplaintTypeLabel(complaint.complaintType)}</span>
        <span>${formatDate(complaint.timestamp)}</span>
      </div>
      
      <div class="complaint-description">${complaint.description}</div>
      
      <div class="complaint-footer">
        <span class="complaint-author">${complaint.name}</span>
        <span>${complaint.email}</span>
      </div>
    </div>
  `).join('');
}

// View complaint details
function viewComplaint(id) {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) return;
  
  const details = `
    Subject: ${complaint.subject}
    Type: ${getComplaintTypeLabel(complaint.complaintType)}
    Severity: ${complaint.severity}
    Description: ${complaint.description}
    Expected Behavior: ${complaint.expectedBehavior || 'Not specified'}
    Location: ${complaint.location || 'Not specified'}
    Browser/Device: ${complaint.browser || 'Not specified'}
    Date/Time: ${formatDate(complaint.timestamp)}
    Contact: ${complaint.name} (${complaint.email})
    Phone: ${complaint.phone || 'Not provided'}
    Screenshots Available: ${complaint.screenshot ? 'Yes' : 'No'}
    Follow-up Requested: ${complaint.followUp ? 'Yes' : 'No'}
  `;
  
  alert(details);
}

// Get complaint type label
function getComplaintTypeLabel(type) {
  const labels = {
    'inaccurate-forecast': 'Inaccurate Forecast',
    'website-bug': 'Website Bug',
    'slow-loading': 'Slow Loading',
    'missing-data': 'Missing Data',
    'location-error': 'Location Error',
    'mobile-issue': 'Mobile Issue',
    'other': 'Other'
  };
  return labels[type] || type;
}

// Filter complaints
function filterComplaints() {
  displayComplaints();
}

// Refresh complaints
function refreshComplaints() {
  displayComplaints();
  updateStats();
  showAlert('Complaints list refreshed.', 'info');
}

// Clear all complaints
function clearAllComplaints() {
  if (confirm('Are you sure you want to clear all complaints? This action cannot be undone.')) {
    complaints = [];
    localStorage.removeItem('complaints');
    displayComplaints();
    updateStats();
    showAlert('All complaints have been cleared.', 'success');
  }
}

// Update statistics
function updateStats() {
  const totalComplaints = complaints.length;
  const criticalComplaints = complaints.filter(c => c.severity === 'critical').length;
  const todayComplaints = complaints.filter(c => {
    const today = new Date().toDateString();
    const complaintDate = new Date(c.timestamp).toDateString();
    return today === complaintDate;
  }).length;
  
  document.getElementById('totalComplaints').textContent = totalComplaints;
  document.getElementById('criticalComplaints').textContent = criticalComplaints;
  document.getElementById('todayComplaints').textContent = todayComplaints;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

// Handle form submission
function handleFormSubmission(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate required fields
  if (!data.name || !data.email || !data.complaintType || !data.severity || !data.subject || !data.description) {
    showAlert('Please fill in all required fields.', 'error');
    return;
  }
  
  // Add complaint
  addComplaint(data);
  
  // Show success message
  showAlert('Complaint submitted successfully! We will review and respond within 24-48 hours.', 'success');
  
  // Reset form
  setTimeout(() => {
    e.target.reset();
    document.getElementById('dateTime').value = new Date().toISOString().slice(0, 16);
  }, 2000);
  
  console.log('Complaint submitted:', data);
}

// Initialize page
function initContactPage() {
  console.log('Initializing Contact Page...');
  
  // Set up form submission
  document.getElementById('complaintForm').addEventListener('submit', handleFormSubmission);
  
  // Auto-fill current date and time
  document.getElementById('dateTime').value = new Date().toISOString().slice(0, 16);
  
  // Display initial complaints
  displayComplaints();
  updateStats();
  
  console.log('Contact Page initialized successfully');
}

// Export functions for global access
window.toggleTheme = toggleTheme;
window.resetForm = resetForm;
window.refreshComplaints = refreshComplaints;
window.clearAllComplaints = clearAllComplaints;
window.filterComplaints = filterComplaints;
window.viewComplaint = viewComplaint;
window.initContactPage = initContactPage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initContactPage();
}); 