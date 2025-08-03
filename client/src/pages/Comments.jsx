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
import { deleteData } from '@/helpers/handleDelete'
import { showToast } from '@/helpers/showToast'

const Comments = () => {
    const [refreshData, setRefreshData] = useState(false)
    const { data, loading, error } = useFetch(`${getEvn('VITE_API_BASE_URL')}/comment/get-all-comment`, {
        method: 'get',
        credentials: 'include'
    }, [refreshData])

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/comment/delete/${id}`, {
                method: 'delete',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                setRefreshData(!refreshData);
                showToast('success', 'Comment deleted successfully');
            } else {
                showToast('error', result.message || 'Failed to delete comment');
            }
        } catch (error) {
            showToast('error', error.message || 'An error occurred while deleting the comment');
        }
    }

    if (loading) return <Loading />
    if (error) {
        showToast('error', error.message);
        return <div>Error loading comments</div>;
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">Comments</h1>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>A list of all comments.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Blog</TableHead>
                                <TableHead>Commented By</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.comments?.length > 0 ? (
                                data.comments.map(comment => (
                                    <TableRow key={comment._id}>
                                        <TableCell>{comment?.blogid?.title || 'Blog not found'}</TableCell>
                                        <TableCell>{comment?.user?.name || 'User not found'}</TableCell>
                                        <TableCell>{comment?.comment}</TableCell>
                                        <TableCell>
                                            <Button 
                                                onClick={() => handleDelete(comment._id)} 
                                                variant="destructive" 
                                                size="icon"
                                            >
                                                <FaRegTrashAlt />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="4" className="text-center">
                                        No comments found
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

export default Comments