ROLE_PERMISSIONS = {
    'Company': {
        'create': ['master_super_admin'],
        'retrieve': ['master_super_admin', 'super_admin'],
        'update': ['master_super_admin', 'super_admin'],
        'delete': ['master_super_admin'],
    },

    'CompanyUser': {
        'create': ['master_super_admin', 'super_admin', 'client_admin'],
        'retrieve': ['master_super_admin', 'super_admin', 'client_admin'],
        'update': ['master_super_admin', 'super_admin', 'client_admin'],
        'delete': ['master_super_admin', 'client_admin'],
    },

    'Resident': {
        'retrieve': ['master_super_admin', 'super_admin', 'client_admin'],
    },

    'Assessment': {
        'create': ['master_super_admin', 'super_admin', 'client_admin', 'nurse'],
        'retrieve': ['master_super_admin', 'super_admin', 'client_admin'],
        'update': ['master_super_admin', 'super_admin'],
        'delete': ['master_super_admin'],
    },

    'CarePlan': {
        'create': ['master_super_admin', 'super_admin'],
        'retrieve': ['master_super_admin', 'super_admin', 'client_admin', 'nurse'],
        'update': ['master_super_admin', 'super_admin'],
        'delete': ['master_super_admin'],
    },

    'Notification': {
        'create': ['master_super_admin', 'super_admin', 'client_admin'],
        'retrieve': ['master_super_admin', 'super_admin', 'client_admin', 'nurse'],
    },

    'Subscription': {
        'create': ['master_super_admin', 'super_admin'],
        'retrieve': ['master_super_admin', 'super_admin'],
        'update': ['master_super_admin', 'super_admin'],
        'delete': ['master_super_admin'],
    }
}
