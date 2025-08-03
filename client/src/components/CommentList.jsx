import { getEvn } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'

import React from 'react'
import { Avatar } from './ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import usericon from '@/assets/images/user.png'
import moment from 'moment'
import { useSelector } from 'react-redux'

const CommentList = ({ props }) => {
    const user = useSelector(state => state.user)
    const { data, loading, error } = useFetch(`${getEvn('VITE_API_BASE_URL')}/comment/get/${props.blogid}`, {
        method: 'get',
        credentials: 'include',
    })

    if (loading) return <div>Loading comments...</div>
    if (error) return <div>Error loading comments</div>

    return (
        <div>
            <h4 className='text-2xl font-bold'>
                {props.newComment ? (
                    <span className='me-2'>{data?.comments?.length + 1 || 1}</span>
                ) : (
                    <span className='me-2'>{data?.comments?.length || 0}</span>
                )}
                Comments
            </h4>
            <div className='mt-5'>
                {props.newComment && (
                    <div className='flex gap-2 mb-3'>
                        <Avatar>
                            <AvatarImage src={user?.user?.avatar || usericon} />
                        </Avatar>
                        <div>
                            <p className='font-bold'>{user?.user?.name}</p>
                            <p>{moment(props.newComment?.createdAt).format('DD-MM-YYYY')}</p>
                            <div className='pt-3'>
                                {props.newComment?.comment}
                            </div>
                        </div>
                    </div>
                )}

                {data?.comments?.length > 0 && data.comments.map(comment => (
                    <div key={comment._id} className='flex gap-2 mb-3'>
                        <Avatar>
                            <AvatarImage src={comment?.user?.avatar || usericon} />
                        </Avatar>
                        <div>
                            <p className='font-bold'>{comment?.user?.name}</p>
                            <p>{moment(comment?.createdAt).format('DD-MM-YYYY')}</p>
                            <div className='pt-3'>
                                {comment?.comment}
                            </div>
                        </div>
                    </div>
                ))}

                {!props.newComment && (!data?.comments || data.comments.length === 0) && (
                    <div className="text-center text-gray-500">
                        No comments yet. Be the first to comment!
                    </div>
                )}
            </div>
        </div>
    )
}

export default CommentList