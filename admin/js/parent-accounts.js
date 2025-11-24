// admin/js/parent-accounts.js - SIMPLIFIED PARENT ACCOUNTS MANAGEMENT

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const parentTableBody = document.getElementById('parentTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    
    // Search options elements
    const searchName = document.getElementById('searchName');
    const searchEmail = document.getElementById('searchEmail');
    const searchStudent = document.getElementById('searchStudent');
    
    // Disable filter button
    filterBtn.disabled = true;

    // Modal Elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const removeModal = new bootstrap.Modal(document.getElementById('removeModal'));
    
    // Toast
    const liveToast = new bootstrap.Toast(document.getElementById('liveToast'));

    // Event Listeners
    searchInput.addEventListener('input', filterTable);
    refreshBtn.addEventListener('click', refreshTable);

    // Search option change listeners
    if (searchName) {
        searchName.addEventListener('change', filterTable);
    }

    if (searchEmail) {
        searchEmail.addEventListener('change', filterTable);
    }

    if (searchStudent) {
        searchStudent.addEventListener('change', filterTable);
    }    
    
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

        if (e.target.closest('.remove-btn')) {
            const btn = e.target.closest('.remove-btn');
            openRemoveModal(
                btn.dataset.parentId,
                btn.dataset.parentName,
                btn.dataset.parentEmail
            );
        }
    });

    // Save changes in edit modal
    document.getElementById('saveChangesBtn').addEventListener('click', saveParentChanges);

    // Confirm actions
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

        // Get search options
        const searchInName = searchName ? searchName.checked : true;
        const searchInEmail = searchEmail ? searchEmail.checked : true;
        const searchInStudent = searchStudent ? searchStudent.checked : true;

        rows.forEach(row => {
            const name = row.dataset.name;
            const email = row.dataset.email;

            // Check search term with options
            let matchesSearch = false;

            if (searchTerm === '') {
                // If no search term, show all rows
                matchesSearch = true;
            } else {
                // Search based on selected options
                if (searchInName && name.includes(searchTerm)) {
                    matchesSearch = true;
                }
                if (!matchesSearch && searchInEmail && email.includes(searchTerm)) {
                    matchesSearch = true;
                }
                if (!matchesSearch && searchInStudent) {
                    // Check student names
                    const studentElements = row.querySelectorAll('.student-item, .fw-semibold');
                    for (let studentEl of studentElements) {
                        if (studentEl.textContent.toLowerCase().includes(searchTerm)) {
                            matchesSearch = true;
                            break;
                        }
                    }
                }
            }

            const shouldShow = matchesSearch;
            row.style.display = shouldShow ? '' : 'none';

            if (shouldShow) visibleRows++;
        });

        visibleCount.textContent = visibleRows;
    }

    function refreshTable() {
        // Add loading animation and disable button
        const refreshIcon = refreshBtn.querySelector('i');
        refreshIcon.classList.add('refresh-spin');
        refreshBtn.disabled = true;

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
                filterTable(); // This will reapply the current search and filters
                showToast('Table refreshed successfully!', 'success');
            }
        })
        .catch(error => {
            console.error('Error refreshing table:', error);
            showToast('Error refreshing table', 'danger');
        })
        .finally(() => {
            // Remove loading animation and re-enable button
            setTimeout(() => {
                refreshIcon.classList.remove('refresh-spin');
                refreshBtn.disabled = false;
            }, 600);
        });
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

    function showToast(message, type = 'success') {
        const toast = document.getElementById('liveToast');
        toast.querySelector('.toast-body').textContent = message;
        toast.className = `toast align-items-center text-white bg-${type}`;
        liveToast.show();
    }
});