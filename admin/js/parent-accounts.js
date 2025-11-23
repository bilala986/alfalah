// admin/js/parent-accounts.js - PARENT ACCOUNTS MANAGEMENT

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterBtn = document.getElementById('filterBtn');
    const parentTableBody = document.getElementById('parentTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    const statusSelect = document.getElementById('statusSelect');
    const studentMatchSelect = document.getElementById('studentMatchSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');

    // Modal Elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const approveModal = new bootstrap.Modal(document.getElementById('approveModal'));
    const removeModal = new bootstrap.Modal(document.getElementById('removeModal'));
    
    // Toast
    const liveToast = new bootstrap.Toast(document.getElementById('liveToast'));

    // State
    let currentFilters = {
        status: 'all',
        studentMatch: 'all'
    };

    // Initialize
    updateRowCounts();

    // Event Listeners
    searchInput.addEventListener('input', filterTable);
    refreshBtn.addEventListener('click', refreshTable);
    filterBtn.addEventListener('click', () => filterModal.show());
    applyFilterBtn.addEventListener('click', applyFilters);
    clearFilterBtn.addEventListener('click', clearFilters);

    // Edit button handlers
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            const btn = e.target.closest('.edit-btn');
            openEditModal(
                btn.dataset.parentId,
                btn.dataset.parentName,
                btn.dataset.parentEmail,
                btn.dataset.parentApproved === '1'
            );
        }

        if (e.target.closest('.approve-btn')) {
            const btn = e.target.closest('.approve-btn');
            openApproveModal(
                btn.dataset.parentId,
                btn.dataset.parentName,
                btn.dataset.parentEmail
            );
        }

        if (e.target.closest('.remove-btn')) {
            const btn = e.target.closest('.remove-btn');
            openRemoveModal(
                btn.dataset.parentId,
                btn.dataset.parentName,
                btn.dataset.parentEmail
            );
        }

        // Student dropdown change
        if (e.target.classList.contains('student-dropdown')) {
            const dropdown = e.target;
            const parentId = dropdown.dataset.parentId;
            const studentId = dropdown.value;
            const studentName = dropdown.options[dropdown.selectedIndex]?.dataset.studentName;
            
            if (studentId) {
                linkStudentToParent(parentId, studentId, studentName);
            }
        }
    });

    // Save changes in edit modal
    document.getElementById('saveChangesBtn').addEventListener('click', saveParentChanges);

    // Confirm actions
    document.getElementById('confirmApprove').addEventListener('click', approveParent);
    document.getElementById('confirmRemove').addEventListener('click', removeParent);

    // Form change detection
    document.getElementById('editName').addEventListener('input', checkFormChanges);
    document.getElementById('editEmail').addEventListener('input', checkFormChanges);
    document.getElementById('editApproved').addEventListener('change', checkFormChanges);

    // Functions
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = parentTableBody.querySelectorAll('tr');
        let visibleRows = 0;

        rows.forEach(row => {
            const name = row.dataset.name;
            const email = row.dataset.email;
            const status = row.dataset.status;
            
            // Check student match filter
            const hasStudents = row.querySelector('.student-dropdown option:not([disabled])') !== null;
            const studentMatchFilter = currentFilters.studentMatch === 'all' || 
                (currentFilters.studentMatch === 'matched' && hasStudents) ||
                (currentFilters.studentMatch === 'unmatched' && !hasStudents);
            
            // Check status filter
            const statusFilter = currentFilters.status === 'all' || 
                (currentFilters.status === 'approved' && status === 'approved') ||
                (currentFilters.status === 'pending' && status === 'pending');
            
            // Check search term
            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            
            const shouldShow = matchesSearch && statusFilter && studentMatchFilter;
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) visibleRows++;
        });

        visibleCount.textContent = visibleRows;
    }

    function refreshTable() {
        refreshBtn.querySelector('i').classList.add('refresh-spin');
        
        fetch(window.location.href, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newTableBody = doc.getElementById('parentTableBody');
            
            if (newTableBody) {
                parentTableBody.innerHTML = newTableBody.innerHTML;
                updateRowCounts();
                filterTable();
            }
        })
        .catch(error => {
            console.error('Error refreshing table:', error);
            showToast('Error refreshing table', 'danger');
        })
        .finally(() => {
            setTimeout(() => {
                refreshBtn.querySelector('i').classList.remove('refresh-spin');
            }, 600);
        });
    }

    function applyFilters() {
        currentFilters.status = statusSelect.value;
        currentFilters.studentMatch = studentMatchSelect.value;
        filterTable();
        filterModal.hide();
    }

    function clearFilters() {
        statusSelect.value = 'all';
        studentMatchSelect.value = 'all';
        currentFilters.status = 'all';
        currentFilters.studentMatch = 'all';
        searchInput.value = '';
        filterTable();
        filterModal.hide();
    }

    function updateRowCounts() {
        const totalRows = parentTableBody.querySelectorAll('tr').length;
        totalCount.textContent = totalRows;
        visibleCount.textContent = totalRows;
    }

    function openEditModal(parentId, name, email, isApproved) {
        document.getElementById('editParentId').value = parentId;
        document.getElementById('editName').value = name;
        document.getElementById('editEmail').value = email;
        document.getElementById('editApproved').checked = isApproved;
        
        document.getElementById('saveChangesBtn').disabled = true;
        editModal.show();
    }

    function openApproveModal(parentId, name, email) {
        document.getElementById('approveParentName').textContent = name;
        document.getElementById('approveParentEmail').textContent = email;
        document.getElementById('confirmApprove').dataset.parentId = parentId;
        approveModal.show();
    }

    function openRemoveModal(parentId, name, email) {
        document.getElementById('removeParentName').textContent = name;
        document.getElementById('removeParentEmail').textContent = email;
        document.getElementById('confirmRemove').dataset.parentId = parentId;
        removeModal.show();
    }

    function checkFormChanges() {
        const saveBtn = document.getElementById('saveChangesBtn');
        saveBtn.disabled = false;
    }

    function saveParentChanges() {
        const parentId = document.getElementById('editParentId').value;
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const isApproved = document.getElementById('editApproved').checked ? 1 : 0;

        const formData = new FormData();
        formData.append('parent_id', parentId);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('is_approved', isApproved);
        formData.append('action', 'edit_parent');

        fetch('../php/edit_parent.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Parent updated successfully', 'success');
                editModal.hide();
                refreshTable();
            } else {
                showToast(data.message || 'Error updating parent', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Network error occurred', 'danger');
        });
    }

    function approveParent() {
        const parentId = document.getElementById('confirmApprove').dataset.parentId;

        const formData = new FormData();
        formData.append('parent_id', parentId);
        formData.append('action', 'approve_parent');

        fetch('../php/approve_parent.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Parent approved successfully', 'success');
                approveModal.hide();
                refreshTable();
            } else {
                showToast(data.message || 'Error approving parent', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Network error occurred', 'danger');
        });
    }

    function removeParent() {
        const parentId = document.getElementById('confirmRemove').dataset.parentId;

        const formData = new FormData();
        formData.append('parent_id', parentId);
        formData.append('action', 'remove_parent');

        fetch('../php/remove_parent.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Parent removed successfully', 'success');
                removeModal.hide();
                refreshTable();
            } else {
                showToast(data.message || 'Error removing parent', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Network error occurred', 'danger');
        });
    }

    function linkStudentToParent(parentId, studentId, studentName) {
        const formData = new FormData();
        formData.append('parent_id', parentId);
        formData.append('student_id', studentId);
        formData.append('action', 'link_student');

        fetch('../php/link_student.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(`Student ${studentName} linked to parent successfully`, 'success');
            } else {
                showToast(data.message || 'Error linking student', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Network error occurred', 'danger');
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('liveToast');
        toast.querySelector('.toast-body').textContent = message;
        toast.className = `toast align-items-center text-white bg-${type}`;
        liveToast.show();
    }
});