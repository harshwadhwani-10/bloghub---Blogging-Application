import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useFetch } from '@/hooks/useFetch'
import { getEvn } from '@/helpers/getEnv'
import { showToast } from '@/helpers/showToast'
import Loading from '@/components/Loading'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaRegTrashAlt } from "react-icons/fa"
import { Badge } from "@/components/ui/badge"

const Users = () => {
    const [refreshData, setRefreshData] = useState(false)
    const currentUser = useSelector((state) => state.user.user)
    const { data: userData, loading, error } = useFetch(`${getEvn('VITE_API_BASE_URL')}/user/get-all-user`, {
        method: 'get',
        credentials: 'include'
    }, [refreshData])

    useEffect(() => {
        if (error) {
            console.error('Error fetching users:', error);
            showToast('error', error.message || 'Failed to load users');
        }
        if (userData) {
           
            console.log('User Data:', userData);
        }
    }, [error, userData]);

    const handleDelete = async (id, email) => {
        try {
            // Prevent deleting admin
            if (email === '202412100@daiict.ac.in') {
                showToast('error', 'Cannot ban admin user');
                return;
            }

            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/user/delete/${id}`, {
                method: 'delete',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setRefreshData(!refreshData);
                showToast('success', data.message || 'User banned and data cleaned successfully');
            } else {
                showToast('error', data.message || 'Failed to ban user');
            }
        } catch (error) {
            showToast('error', error.message || 'An error occurred while banning the user');
        }
    }

    if (loading) return <Loading />
    if (error) {
        return <div className="text-center p-4">Error loading users: {error.message}</div>;
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">Users</h1>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>A list of all users.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userData?.users?.length > 0 ? (
                                userData.users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            {user.isBanned ? (
                                                <Badge variant="destructive">Banned</Badge>
                                            ) : (
                                                <Badge variant="outline">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(user._id, user.email)}
                                                disabled={user.email === currentUser?.email || user.isBanned}
                                            >
                                                <FaRegTrashAlt />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="5" className="text-center">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default Users 