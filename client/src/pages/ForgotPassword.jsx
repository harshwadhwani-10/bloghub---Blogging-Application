import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React from 'react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card } from '@/components/ui/card'
import { RouteIndex, RouteSignIn, RouteResetPassword } from '@/helpers/RouteName'
import { Link, useNavigate } from 'react-router-dom'
import { showToast } from '@/helpers/showToast'
import { getEvn } from '@/helpers/getEnv'
import logo from '@/assets/images/logo-white.png'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const formSchema = z.object({
        email: z.string().email('Please enter a valid email address')
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values) {
        try {
            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/auth/send-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            showToast('success', data.message)
            navigate(RouteResetPassword, { state: { email: values.email } })
        } catch (error) {
            showToast('error', error.message)
        }
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
                    Enter your email address and we'll send you a code to reset your password.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='mt-5'>
                            <Button type="submit" className="w-full">Send Reset Code</Button>
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

export default ForgotPassword 