import React from 'react';
import { usePermissions } from '../Context/PermissionsContext';
import { usePermissionCheck } from '../utils/permissionUtils';

const PermissionDebug = () => {
    const {
        effectivePermissions,
        superAdminPermissions,
        isInitialized,
        loading,
        authError
    } = usePermissions();

    const { checkPermission } = usePermissionCheck();

    const testPermissions = [
        'Candidates', 'Positions', 'Interviews', 'MockInterviews',
        'InterviewTemplates', 'Assessments', 'Analytics', 'SupportDesk',
        'QuestionBank', 'Billing', 'Wallet'
    ];

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '2px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 9999,
            fontSize: '12px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🔍 Permission Debug</h3>

            <div style={{ marginBottom: '10px' }}>
                <strong>Status:</strong>
                <div>✅ Initialized: {isInitialized ? 'Yes' : 'No'}</div>
                <div>🔄 Loading: {loading ? 'Yes' : 'No'}</div>
                <div>❌ Error: {authError || 'None'}</div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Effective Permissions:</strong>
                <pre style={{
                    background: '#f5f5f5',
                    padding: '5px',
                    fontSize: '10px',
                    maxHeight: '100px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(effectivePermissions, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Super Admin Permissions:</strong>
                <pre style={{
                    background: '#f5f5f5',
                    padding: '5px',
                    fontSize: '10px',
                    maxHeight: '100px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(superAdminPermissions, null, 2)}
                </pre>
            </div>

            <div>
                <strong>Permission Check Results:</strong>
                {testPermissions.map(permission => (
                    <div key={permission} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '2px 0'
                    }}>
                        <span>{permission}:</span>
                        <span style={{
                            color: checkPermission(permission) ? 'green' : 'red',
                            fontWeight: 'bold'
                        }}>
                            {checkPermission(permission) ? '✅' : '❌'}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                }}
            >
                🔄 Refresh
            </button>
        </div>
    );
};

export default PermissionDebug; 