import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React, { useState } from 'react'
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
import Loading from '@/components/Loading'
import { FaRegTrashAlt } from "react-icons/fa"
import { showToast } from '@/helpers/showToast'
import usericon from '@/assets/images/user.png'
import moment from 'moment'

const User = () => {
    const [refreshData, setRefreshData] = useState(false)
    const { data, loading, error } = useFetch(`${getEvn('VITE_API_BASE_URL')}/user/get-all-user`, {
        method: 'get',
        credentials: 'include'
    }, [refreshData])

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

            const result = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 404) {
                    showToast('error', 'User not found');
                } else if (response.status === 403) {
                    showToast('error', 'Cannot ban admin user');
                } else {
                    showToast('error', result.message || 'Failed to ban user');
                }
                return;
            }

            setRefreshData(!refreshData);
            showToast('success', result.message || 'User banned and data cleaned successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('error', 'An error occurred while banning the user');
        }
    }

    if (loading) return <Loading />
    if (error) {
        showToast('error', error.message);
        return <div>Error loading users</div>;
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
                                <TableHead>Role</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Avatar</TableHead>
                                <TableHead>Dated</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.users?.length > 0 ? (
                                data.users.map(user => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <img src={user.avatar || usericon} className='w-10' alt={user.name} />
                                        </TableCell>
                                        <TableCell>{moment(user.createdAt).format('DD-MM-YYYY')}</TableCell>
                                        <TableCell>
                                            <Button 
                                                onClick={() => handleDelete(user._id, user.email)} 
                                                variant="destructive" 
                                                size="icon"
                                                disabled={user.email === '202412100@daiict.ac.in'}
                                            >
                                                <FaRegTrashAlt />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="6" className="text-center">
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

export default User