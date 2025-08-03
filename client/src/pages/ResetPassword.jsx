import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React from 'react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card } from '@/components/ui/card'
import { RouteIndex, RouteSignIn } from '@/helpers/RouteName'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { showToast } from '@/helpers/showToast'
import { getEvn } from '@/helpers/getEnv'
import logo from '@/assets/images/logo-white.png'

const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email

    const formSchema = z.object({
        code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            newPassword: '',
            confirmPassword: ''
        },
    })

    async function onSubmit(values) {
        try {
            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: values.code,
                    newPassword: values.newPassword
                })
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            showToast('success', data.message)
            navigate(RouteSignIn)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    if (!email) {
        return (
            <div className='flex justify-center items-center h-screen w-screen'>
                <Card className="w-[400px] p-5">
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold mb-2'>Invalid Access</h2>
                        <p className='text-gray-600 mb-4'>Please request a password reset first.</p>
                        <Link to={RouteSignIn} className='text-blue-500 hover:underline'>
                            Go to Sign In
                        </Link>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className='flex justify-center items-center h-screen w-screen'>
            <Card className="w-[400px] p-5">
                <div className='flex justify-center items-center mb-2'>
                    <Link to={RouteIndex}>
                        <img src={logo} alt="Logo" />
                    </Link>
                </div>
                <h1 className='text-2xl font-bold text-center mb-5'>Reset Password</h1>
                <p className='text-center text-gray-600 mb-5'>
                    Enter the code sent to your email and set your new password.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reset Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter 6-digit code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='mt-5'>
                            <Button type="submit" className="w-full">Reset Password</Button>
                            <div className='mt-5 text-sm flex justify-center items-center gap-2'>
                                <p>Remember your password?</p>
                                <Link className='text-blue-500 hover:underline' to={RouteSignIn}>Sign In</Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

export default ResetPassword 