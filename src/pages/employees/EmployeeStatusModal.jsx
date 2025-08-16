import { useState } from 'react';
import { Modal, Button, Select, message } from 'antd';
import { updateEmployeeStatus } from '../../api/services/employeeService';

const EmployeeStatusModal = ({ employeeId, currentStatus, visible, onClose, onSuccess }) => {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!status) {
            message.warning('Iltimos, statusni tanlang');
            return;
        }

        setLoading(true);
        try {
            await updateEmployeeStatus(employeeId, status);
            message.success('Status muvaffaqiyatli yangilandi');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Status yangilashda xato:', error);
            message.error('Status yangilashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Employee Status"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={handleSave}
                    loading={loading}
                >
                    Save
                </Button>,
            ]}
        >
            <Select
                placeholder="Select status"
                value={status}
                onChange={(value) => setStatus(value)}
                style={{ width: '100%' }}
                options={[
                    { value: 'free', label: 'Free' },
                    { value: 'sick', label: 'Sick' },
                    { value: 'working', label: 'Working' },
                    { value: 'overload', label: 'Overload' },
                    { value: 'on_leave', label: 'On Leave' },
                ]}
            />
        </Modal>
    );
};

export default EmployeeStatusModal;