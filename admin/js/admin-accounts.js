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
    
    // Toast notification function
    function showToast(message, type = 'success') {
        const toastEl = document.getElementById('liveToast');
        const toastBody = toastEl.querySelector('.toast-body');

        // Set toast type and message
        toastEl.className = `toast align-items-center ${type === 'success' ? 'success' : 'danger'}`;
        toastBody.textContent = message;

        // Show toast
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    // Refresh table data
    function refreshTableData() {
        fetch(`../php/get_admins.php?bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateTable(data.admins);
                    showToast('Table refreshed successfully!', 'success');
                } else {
                    showToast('Error refreshing table', 'error');
                }
            })
            .catch(error => {
                console.error('Error refreshing table:', error);
                showToast('Error refreshing table', 'error');
            });
    }

    // Update table with new data
    function updateTable(admins) {
        adminTableBody.innerHTML = '';
        
        if (admins.length === 0) {
            adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No admin accounts found.</td></tr>';
            visibleCount.textContent = '0';
            rows = [];
            return;
        }
        
        admins.forEach(admin => {
            const row = document.createElement('tr');
            row.setAttribute('data-name', admin.name.toLowerCase());
            row.setAttribute('data-email', admin.email.toLowerCase());
            row.setAttribute('data-status', admin.is_approved ? 'approved' : 'pending');
            row.setAttribute('data-admin-id', admin.id);
            
            const statusBadge = admin.is_approved ? 
                '<span class="badge bg-success">Approved</span>' : 
                '<span class="badge bg-danger">Pending</span>';
            
            const approveButton = !admin.is_approved ? 
                `<button type="button" class="btn btn-outline-success approve-btn" data-admin-id="${admin.id}" data-admin-name="${admin.name}" data-admin-email="${admin.email}">
                    <i class="bi bi-check-lg"></i> Approve
                </button>` : '';
            
            const removeButton = admin.id != window.currentAdminId ? 
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
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        const refreshIcon = this.querySelector('i');
        refreshIcon.classList.add('refresh-spin');
        refreshTableData();
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

    // Edit modal functionality
    function handleEditClick() {
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editModal.hide();
                showToast('Admin updated successfully!', 'success');
                refreshTableData();
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
                refreshTableData();
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
                refreshTableData();
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
});