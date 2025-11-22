// admin/js/admin-accounts.js - FIXED VERSION WITH ALL UPDATES
document.addEventListener('DOMContentLoaded', function() {
    // Toast notification function
    function showToast(message, type = 'success') {
        const toastEl = document.getElementById('liveToast');
        const toastBody = toastEl.querySelector('.toast-body');

        // Set toast type and message
        toastEl.className = `toast align-items-center ${type === 'success' ? 'bg-success' : 'bg-danger'}`;
        toastBody.textContent = message;

        // Show toast
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

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
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // Edit modal elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editAdminId = document.getElementById('editAdminId');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editApproved = document.getElementById('editApproved');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    
    // Approve/Remove modal elements
    const approveModal = new bootstrap.Modal(document.getElementById('approveModal'));
    const removeModal = new bootstrap.Modal(document.getElementById('removeModal'));
    const approveAdminName = document.getElementById('approveAdminName');
    const approveAdminEmail = document.getElementById('approveAdminEmail');
    const removeAdminName = document.getElementById('removeAdminName');
    const removeAdminEmail = document.getElementById('removeAdminEmail');
    const confirmApprove = document.getElementById('confirmApprove');
    const confirmRemove = document.getElementById('confirmRemove');
    
    // Current filter state
    let currentStatusFilter = 'all';
    let originalFormData = {};
    let currentActionAdminId = null;

    // Get all rows (will be updated on refresh)
    let rows = adminTableBody.querySelectorAll('tr[data-name]');

    // Refresh table data
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing table data...');
        console.log('Current Admin ID:', currentAdminId);
        
        fetch(`../php/get_admins.php?bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Received data from server:', data);
                if (data.success) {
                    updateTable(data.admins);
                    if (shouldShowToast) {
                        showToast('Table refreshed successfully!', 'success');
                    }
                } else {
                    if (shouldShowToast) {
                        showToast('Error refreshing table', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing table:', error);
                if (shouldShowToast) {
                    showToast('Error refreshing table', 'error');
                }
            });
    }

    // Update table with new data - FIXED VERSION
    function updateTable(admins) {
        console.log('Updating table with admins:', admins);
        adminTableBody.innerHTML = '';
        
        if (admins.length === 0) {
            adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No admin accounts found.</td></tr>';
            // Update the full count text
            const countText = visibleCount.parentElement;
            if (countText) {
                countText.textContent = 'Showing 0 of 0 admins';
            }
            rows = [];
            return;
        }
        
        admins.forEach(admin => {
            const row = document.createElement('tr');
            row.setAttribute('data-name', admin.name.toLowerCase());
            row.setAttribute('data-email', admin.email.toLowerCase());
            // FIX: Use proper status value based on is_approved
            const statusValue = admin.is_approved == 1 ? 'approved' : 'pending';
            row.setAttribute('data-status', statusValue);
            row.setAttribute('data-admin-id', admin.id);
            
            // Debug logging
            console.log('Processing admin:', admin.name, 'ID:', admin.id, 'Approved:', admin.is_approved, 'Status:', statusValue);
            console.log('Current Admin ID for comparison:', currentAdminId);
            
            const statusBadge = admin.is_approved == 1 ? 
                '<span class="badge bg-success">Approved</span>' : 
                '<span class="badge bg-danger">Pending</span>';
            
            // FIX: Use == for comparison to handle string vs number
            const approveButton = admin.is_approved == 0 ? 
                `<button type="button" class="btn btn-outline-success approve-btn" data-admin-id="${admin.id}" data-admin-name="${admin.name}" data-admin-email="${admin.email}">
                    <i class="bi bi-check-lg"></i> Approve
                </button>` : '';
            
            // FIX: Use explicit comparison with parseInt
            const adminIdInt = parseInt(admin.id);
            const currentAdminIdInt = parseInt(currentAdminId);
            const isCurrentUser = adminIdInt === currentAdminIdInt;
            
            console.log('Is current user?', isCurrentUser, 'Admin ID:', adminIdInt, 'Current ID:', currentAdminIdInt);
            
            const removeButton = !isCurrentUser ? 
                `<button type="button" class="btn btn-outline-danger remove-btn" data-admin-id="${admin.id}" data-admin-name="${admin.name}" data-admin-email="${admin.email}">
                    <i class="bi bi-trash"></i> Remove
                </button>` : 
                `<button class="btn btn-outline-secondary" disabled title="Cannot delete your own account">
                    <i class="bi bi-trash"></i> Remove
                </button>`;
            
            row.innerHTML = `
                <td class="fw-semibold">${admin.name}</td>
                <td>${admin.email}</td>
                <td class="mobile-hide">${admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}</td>
                <td class="mobile-hide">
                    ${admin.last_login ? new Date(admin.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '<span class="text-muted">Never</span>'}
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary edit-btn" data-admin-id="${admin.id}" data-admin-name="${admin.name}" data-admin-email="${admin.email}" data-admin-approved="${admin.is_approved}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        ${approveButton}
                        ${removeButton}
                    </div>
                </td>
            `;
            
            adminTableBody.appendChild(row);
        });
        
        // Reattach event listeners to new buttons
        attachEventListeners();
        
        // Update rows and filter
        rows = adminTableBody.querySelectorAll('tr[data-name]');
        
        // Update the total count display
        const countText = visibleCount.parentElement;
        if (countText) {
            countText.textContent = `Showing ${rows.length} of ${rows.length} admins`;
        }
        
        filterTable();
    }

    // Attach event listeners to dynamic buttons
    function attachEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        
        // Approve buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', handleApproveClick);
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', handleRemoveClick);
        });
    }

    // Filter function - FIXED VERSION
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleRows = 0;
        let totalRows = 0;

        rows.forEach(row => {
            totalRows++;
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

        // Update both numbers - visible count and total count
        visibleCount.textContent = visibleRows;
        
        // Update the total count in the text
        const countText = visibleCount.parentElement;
        if (countText) {
            countText.textContent = `Showing ${visibleRows} of ${totalRows} admins`;
        }
        
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
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        const refreshIcon = this.querySelector('i');
        refreshIcon.classList.add('refresh-spin');
        refreshTableData(true); // true = show toast
        setTimeout(() => refreshIcon.classList.remove('refresh-spin'), 600);
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

    // Clear filter functionality
    clearFilterBtn.addEventListener('click', function() {
        currentStatusFilter = 'all';
        statusSelect.value = 'all';
        filterTable();
        filterModal.hide();
    });

    // Edit modal functionality - WITH DEBUG LOGGING
    function handleEditClick() {
        const adminId = this.getAttribute('data-admin-id');
        const adminName = this.getAttribute('data-admin-name');
        const adminEmail = this.getAttribute('data-admin-email');
        const adminApproved = this.getAttribute('data-admin-approved');

        // DEBUG LOGGING - CRITICAL
        console.log('=== EDIT MODAL DEBUG ===');
        console.log('Admin ID:', adminId);
        console.log('Admin Name:', adminName);
        console.log('Admin Email:', adminEmail);
        console.log('Admin Approved (raw from data attribute):', adminApproved);
        console.log('Type of adminApproved:', typeof adminApproved);
        console.log('adminApproved === "1":', adminApproved === '1');
        console.log('adminApproved === "0":', adminApproved === '0');
        console.log('adminApproved == 1:', adminApproved == 1);
        console.log('adminApproved == 0:', adminApproved == 0);

        // Populate form
        editAdminId.value = adminId;
        editName.value = adminName;
        editEmail.value = adminEmail;

        // Check what the checkbox state will be
        const checkboxWillBeChecked = adminApproved === '1';
        console.log('Checkbox will be set to:', checkboxWillBeChecked ? 'CHECKED' : 'UNCHECKED');

        editApproved.checked = checkboxWillBeChecked;

        // Verify the actual checkbox state
        console.log('Actual checkbox state after setting:', editApproved.checked);
        console.log('=== END DEBUG ===');

        // Store original data for comparison
        originalFormData = {
            name: adminName,
            email: adminEmail,
            is_approved: checkboxWillBeChecked
        };

        // Reset save button
        saveChangesBtn.disabled = true;

        editModal.show();
    }

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

    // Save changes functionality - WITH DEBUG LOGGING
    saveChangesBtn.addEventListener('click', function() {
        const formData = new FormData();
        const isApproved = editApproved.checked ? '1' : '0';

        // DEBUG: What are we sending to the server?
        console.log('=== SAVE DEBUG ===');
        console.log('Admin ID:', editAdminId.value);
        console.log('Name:', editName.value);
        console.log('Email:', editEmail.value);
        console.log('Is Approved (checkbox checked):', editApproved.checked);
        console.log('Is Approved (value being sent):', isApproved);
        console.log('=== END SAVE DEBUG ===');

        formData.append('admin_id', editAdminId.value);
        formData.append('name', editName.value);
        formData.append('email', editEmail.value);
        formData.append('is_approved', isApproved);

        // Show loading state
        saveChangesBtn.disabled = true;
        saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        fetch('../php/edit_admin.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data); // Debug server response
            if (data.success) {
                editModal.hide();
                showToast('Admin updated successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error details:', error);
            showToast('Error updating admin: ' + error.message, 'error');
        })
        .finally(() => {
            saveChangesBtn.disabled = false;
            saveChangesBtn.innerHTML = 'Save Changes';
        });
    });

    // Approve functionality
    function handleApproveClick() {
        const adminId = this.getAttribute('data-admin-id');
        const adminName = this.getAttribute('data-admin-name');
        const adminEmail = this.getAttribute('data-admin-email');
        
        approveAdminName.textContent = adminName;
        approveAdminEmail.textContent = adminEmail;
        currentActionAdminId = adminId;
        
        approveModal.show();
    }

    confirmApprove.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Approving...';

        fetch('../php/approve_admin_action.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `admin_id=${currentActionAdminId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                approveModal.hide();
                showToast('Admin approved successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Approve error:', error);
            showToast('Error approving admin', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Approve';
            currentActionAdminId = null;
        });
    });

    // Remove functionality
    function handleRemoveClick() {
        const adminId = this.getAttribute('data-admin-id');
        const adminName = this.getAttribute('data-admin-name');
        const adminEmail = this.getAttribute('data-admin-email');
        
        removeAdminName.textContent = adminName;
        removeAdminEmail.textContent = adminEmail;
        currentActionAdminId = adminId;
        
        removeModal.show();
    }

    confirmRemove.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Removing...';

        fetch('../php/remove_admin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `admin_id=${currentActionAdminId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                removeModal.hide();
                showToast('Admin removed successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Remove error:', error);
            showToast('Error removing admin', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Remove';
            currentActionAdminId = null;
        });
    });

    // Initialize
    attachEventListeners();
    filterTable();
    
    // Debug: Check if variables are properly set
    console.log('Initialization complete - Browser Instance ID:', browserInstanceId);
    console.log('Initialization complete - Current Admin ID:', currentAdminId);
});