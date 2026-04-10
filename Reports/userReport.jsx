import { useState, useEffect } from 'react';
import { deleteUser, fetchUsers } from '../services/userService.js';
import EditUser from './editUser';
import AddUser from '../Pages/addUser';
import { Button, Card, Modal, Table, ToastContainer, toast, SearchBar, EmptyState } from '../Components';
import { FiPlus, FiTrash2, FiLock, FiPrinter } from 'react-icons/fi';

const UserReport = () => {
    const [users, setUsers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [userGroup, setUserGroup] = useState('');
    const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

    useEffect(() => {
        const fetchUserGroup = async () => {
            const group = localStorage.getItem("User_group");
            setUserGroup(group);
        };

        fetchUserGroup();

        fetchUsers()
            .then(res => {
                if (res.data.success) {
                    const userMap = res.data.result.reduce((acc, user) => {
                        if (user.User_uuid && user.User_name && user.Mobile_number) {
                            acc[user._id] = {
                                name: user.User_name,
                                mobile: user.Mobile_number,
                                group: user.User_group,
                                taskGroups: user.Allowed_Task_Groups || [],
                                userUuid: user.User_uuid,
                                isUsed: user.isUsed || false,
                            };
                        }
                        return acc;
                    }, {});

                    setUsers(userMap);
                } else {
                    setUsers({});
                }
            })
            .catch(err => {
                toast.error("Error fetching users list");
                console.log(err);
            });
    }, []);

    const handleEdit = (userId) => {
        setSelectedUserId(userId);
        setShowEditModal(true);
    };

    const handleDeleteClick = (userId) => {
        const userToDelete = users[userId];
        if (userToDelete) {
            setSelectedUser(userToDelete);
            setSelectedUserId(userId);
            setShowDeleteModal(true);
            setDeleteErrorMessage('');
        } else {
            toast.error('User not found');
        }
    };

    const handleDeleteConfirm = () => {
        deleteUser(selectedUser?.userUuid)
            .then(res => {
                if (res.data.success) {
                    setUsers(prevUser => {
                        const newUser = { ...prevUser };
                        delete newUser[selectedUserId];
                        return newUser;
                    });
                    toast.success("User deleted successfully");
                } else {
                    toast.error("Delete failed: " + res.data.message);
                }
                setShowDeleteModal(false);
            })
            .catch(err => {
                toast.error("Error deleting user");
                console.log(err);
                setShowDeleteModal(false);
            });
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <Card className="pt-12 pb-20 max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by user name or group"
                        className="flex-1"
                    />
                    <Button
                        variant="secondary"
                        onClick={handlePrint}
                        leftIcon={FiPrinter}
                        aria-label="Print"
                        className="p-2"
                    />
                    <Button
                        onClick={handleAddUser}
                        leftIcon={FiPlus}
                        aria-label="Add user"
                        className="p-2"
                    />
                </div>
                {Object.keys(users).length > 0 ? (
                    <Table
                        columns={(() => {
                            const cols = [
                                { Header: 'Name', accessor: 'name' },
                                { Header: 'Mobile', accessor: 'mobile' },
                                { Header: 'Task Groups', accessor: 'taskGroups' },
                            ];
                            if (userGroup === 'Admin User') {
                                cols.push({ Header: 'Actions', accessor: 'actions' });
                            }
                            return cols;
                        })()}
                        data={Object.entries(users)
                            .filter(([, user]) =>
                                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (user.group && user.group.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map(([id, user]) => ({
                                name: (
                                    <span onClick={() => handleEdit(id)} className="cursor-pointer text-primary">
                                        {user.name}
                                    </span>
                                ),
                                mobile: (
                                    <span onClick={() => handleEdit(id)} className="cursor-pointer text-primary">
                                        {user.mobile}
                                    </span>
                                ),
                                taskGroups: user.taskGroups?.length ? user.taskGroups.join(', ') : '-',
                                ...(userGroup === 'Admin User'
                                    ? {
                                          actions: user.isUsed ? (
                                              <FiLock
                                                  className="text-gray-400"
                                                  title="Cannot delete - linked to transactions/orders"
                                              />
                                          ) : (
                                              <FiTrash2
                                                  className="text-red-500 cursor-pointer hover:text-red-600"
                                                  onClick={() => handleDeleteClick(id)}
                                              />
                                          ),
                                      }
                                    : {}),
                            }))}
                    />
                ) : (
                    <EmptyState message="No data available for the selected filters." />
                )}
            </Card>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit User"
            >
                <EditUser
                    userId={selectedUserId}
                    userData={users[selectedUserId]}
                    closeModal={() => setShowEditModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                title={`Delete ${selectedUser?.name}?`}
                actions={[
                    <Button key="confirm" variant="danger" onClick={handleDeleteConfirm}>
                        Yes
                    </Button>,
                    <Button key="cancel" variant="secondary" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>,
                ]}
            >
                {deleteErrorMessage && <p className="text-red-500">{deleteErrorMessage}</p>}
            </Modal>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add User"
            >
                <AddUser closeModal={() => setShowAddModal(false)} />
            </Modal>
        </>
    );
};

export default UserReport;
