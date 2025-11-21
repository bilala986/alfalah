// admin/js/admin-accounts.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterBtn = document.getElementById('filterBtn');
    const adminTableBody = document.getElementById('adminTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const rows = adminTableBody.querySelectorAll('tr[data-name]');
    
    // Modal elements
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const statusSelect = document.getElementById('statusSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    
    // Current filter state
    let currentStatusFilter = 'all';

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
        
        // Add spin animation
        refreshIcon.classList.add('refresh-spin');
        
        // Clear filters
        searchInput.value = '';
        currentStatusFilter = 'all';
        statusSelect.value = 'all';
        filterTable();
        
        // Remove spin animation after it completes
        setTimeout(() => {
            refreshIcon.classList.remove('refresh-spin');
        }, 600);
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