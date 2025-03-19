import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Snackbar, Alert } from '@mui/material';

const Notifications = forwardRef((props, ref) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    const showSnackbar = useCallback((msg, severity = 'success') => {
        setMessage(msg);
        setSeverity(severity);
        setOpen(true);
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    useImperativeHandle(ref, () => ({
        showSnackbar
    }));

    return (
        <Snackbar 
            open={open} 
            autoHideDuration={3000} 
            onClose={handleClose} 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <Alert onClose={handleClose} severity={severity} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
});

export default Notifications;