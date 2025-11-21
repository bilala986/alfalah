// admin/js/admin-accounts.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterBtn = document.getElementById('filterBtn');
    const adminTableBody = document.getElementById('adminTableBody');
    const visibleCount = document.getElementById('visibleCount');
    
    // Modal elements
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const statusSelect = document.getElementById('statusSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    
    // Edit modal elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editAdminId = document.getElementById('editAdminId');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editApproved = document.getElementById('editApproved');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    
    // Current filter state
    let currentStatusFilter = 'all';
    let originalFormData = {};

    // Get all rows (will be updated on refresh)
    let rows = adminTableBody.querySelectorAll('tr[data-name]');

    // Filter function
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleRows = 0;

        rows.forEach(row => {
            const name = row.getAttribute('data-name');
            const email = row.getAttribute('data-email');
            const status = row.getAttribute('data-status');
            
            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesStatus = currentStatusFilter === 'all' || status === currentStatusFilter;
            
            if (matchesSearch && matchesStatus) {
                row.style.display = '';
                visibleRows++;
            } else {
                row.style.display = 'none';
            }
        });

        visibleCount.textContent = visibleRows;
        
        // Update filter button appearance based on active filter
        if (currentStatusFilter === 'all') {
            filterBtn.classList.remove('btn-success');
            filterBtn.classList.add('btn-outline-primary');
        } else {
            filterBtn.classList.remove('btn-outline-primary');
            filterBtn.classList.add('btn-success');
        }
    }

    // Search functionality
    searchInput.addEventListener('input', filterTable);
    
    // Refresh functionality - actually reload the page to get fresh data
    refreshBtn.addEventListener('click', function() {
        const refreshIcon = this.querySelector('i');
        
        // Add spin animation
        refreshIcon.classList.add('refresh-spin');
        
        // Reload the page after a short delay to show the animation
        setTimeout(() => {
            window.location.href = `admin-accounts.php?bid=${browserInstanceId}`;
        }, 300);
    });
    
    // Filter modal functionality
    filterBtn.addEventListener('click', function() {
        statusSelect.value = currentStatusFilter;
        filterModal.show();
    });
    
    applyFilterBtn.addEventListener('click', function() {
        currentStatusFilter = statusSelect.value;
        filterTable();
        filterModal.hide();
    });

    // Edit modal functionality
    const editButtons = document.querySelectorAll('.edit-btn');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            const adminName = this.getAttribute('data-admin-name');
            const adminEmail = this.getAttribute('data-admin-email');
            const adminApproved = this.getAttribute('data-admin-approved');
            
            // Populate form
            editAdminId.value = adminId;
            editName.value = adminName;
            editEmail.value = adminEmail;
            editApproved.checked = adminApproved === '1';
            
            // Store original data for comparison
            originalFormData = {
                name: adminName,
                email: adminEmail,
                is_approved: adminApproved === '1'
            };
            
            // Reset save button
            saveChangesBtn.disabled = true;
            
            editModal.show();
        });
    });

    // Form change detection
    [editName, editEmail, editApproved].forEach(element => {
        element.addEventListener('input', checkFormChanges);
        element.addEventListener('change', checkFormChanges);
    });

    function checkFormChanges() {
        const currentData = {
            name: editName.value,
            email: editEmail.value,
            is_approved: editApproved.checked
        };
        
        const hasChanges = currentData.name !== originalFormData.name ||
                          currentData.email !== originalFormData.email ||
                          currentData.is_approved !== originalFormData.is_approved;
        
        saveChangesBtn.disabled = !hasChanges;
    }

    // Save changes functionality
    saveChangesBtn.addEventListener('click', function() {
        const formData = new FormData();
        formData.append('admin_id', editAdminId.value);
        formData.append('name', editName.value);
        formData.append('email', editEmail.value);
        formData.append('is_approved', editApproved.checked ? '1' : '0');

        // Show loading state
        saveChangesBtn.disabled = true;
        saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        fetch('../php/edit_admin.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                // Get more details about the error
                return response.text().then(text => {
                    console.log('Error response text:', text);
                    throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
                });
            }
            return response.text();
        })
        .then(text => {
            console.log('Raw response:', text);
            
            if (!text) {
                throw new Error('Empty response from server');
            }
            
            try {
                const data = JSON.parse(text);
                return data;
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid JSON response: ' + text.substring(0, 100));
            }
        })
        .then(data => {
            if (data.success) {
                editModal.hide();
                // Show success message and reload to see changes
                alert('Admin updated successfully!');
                window.location.href = `admin-accounts.php?bid=${browserInstanceId}`;
            } else {
                alert('Error: ' + data.message);
                // Reset button
                saveChangesBtn.disabled = false;
                saveChangesBtn.innerHTML = 'Save Changes';
            }
        })
        .catch(error => {
            console.error('Fetch error details:', error);
            alert('Error updating admin: ' + error.message);
            // Reset button
            saveChangesBtn.disabled = false;
            saveChangesBtn.innerHTML = 'Save Changes';
        });
    });

    // Approve modal functionality
    const approveButtons = document.querySelectorAll('.approve-btn');
    const approveModal = new bootstrap.Modal(document.getElementById('approveModal'));
    const approveAdminName = document.getElementById('approveAdminName');
    const approveAdminEmail = document.getElementById('approveAdminEmail');
    const confirmApprove = document.getElementById('confirmApprove');

    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            const adminName = this.getAttribute('data-admin-name');
            const adminEmail = this.getAttribute('data-admin-email');
            
            approveAdminName.textContent = adminName;
            approveAdminEmail.textContent = adminEmail;
            confirmApprove.href = `?action=approve&id=${adminId}&bid=${browserInstanceId}`;
            
            approveModal.show();
        });
    });

    // Remove modal functionality
    const removeButtons = document.querySelectorAll('.remove-btn');
    const removeModal = new bootstrap.Modal(document.getElementById('removeModal'));
    const removeAdminName = document.getElementById('removeAdminName');
    const removeAdminEmail = document.getElementById('removeAdminEmail');
    const confirmRemove = document.getElementById('confirmRemove');

    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            const adminName = this.getAttribute('data-admin-name');
            const adminEmail = this.getAttribute('data-admin-email');
            
            removeAdminName.textContent = adminName;
            removeAdminEmail.textContent = adminEmail;
            confirmRemove.href = `?action=delete&id=${adminId}&bid=${browserInstanceId}`;
            
            removeModal.show();
        });
    });

    // Initialize table count
    filterTable();
});