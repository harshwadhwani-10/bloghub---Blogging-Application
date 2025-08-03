import React, { useEffect, useState, useCallback } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import slugify from 'slugify'
import { showToast } from '@/helpers/showToast'
import { getEvn } from '@/helpers/getEnv'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFetch } from '@/hooks/useFetch'
import Dropzone from 'react-dropzone'
import Editor from '@/components/Editor'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RouteBlog } from '@/helpers/RouteName'
import { decode } from 'entities'
import { debounce } from 'lodash'

const AddBlog = () => {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const { data: categoryData, loading, error } = useFetch(`${getEvn('VITE_API_BASE_URL')}/category/all-category`, {
        method: 'get',
        credentials: 'include'
    })

    const [filePreview, setPreview] = useState('')
    const [file, setFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasDraft, setHasDraft] = useState(false)
    const [saveError, setSaveError] = useState(null)

    const formSchema = z.object({
        category: z.string().min(3, 'Category must be at least 3 character long.'),
        title: z.string().min(3, 'Title must be at least 3 character long.'),
        slug: z.string().min(3, 'Slug must be at least 3 character long.'),
        blogContent: z.string().min(3, 'Blog content must be at least 3 character long.'),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: '',
            title: '',
            slug: '',
            blogContent: '',
        },
    })

    // Fetch draft on component mount
    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/drafts`, {
                    method: 'get',
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch draft');
                }
                
                const data = await response.json();
                
                if (data.draft) {
                    // Prefill form with draft data
                    form.setValue('category', data.draft.category || '');
                    form.setValue('title', data.draft.title || '');
                    form.setValue('slug', data.draft.slug || '');
                    form.setValue('blogContent', data.draft.blogContent ? decode(data.draft.blogContent) : '');
                    
                    if (data.draft.featuredImage) {
                        setPreview(data.draft.featuredImage);
                    }
                    
                    setHasDraft(true);
                }
            } catch (error) {
                console.error('Error fetching draft:', error);
                setSaveError('Failed to load draft. Please try again.');
            }
        };
        
        fetchDraft();
    }, []);

    const handleEditorData = (event, editor) => {
        const data = editor.getData()
        form.setValue('blogContent', data)
    }

    const blogTitle = form.watch('title')

    useEffect(() => {
        if (blogTitle) {
            const slug = slugify(blogTitle, { lower: true })
            form.setValue('slug', slug)
        }
    }, [blogTitle])

    // Auto-save draft when form values change
    const autoSaveDraft = useCallback(
        debounce(async (values) => {
            if (!user.isLoggedIn) return;
            
            try {
                setIsLoading(true);
                setSaveError(null);
                
                const formData = new FormData();
                if (file) {
                    formData.append('file', file);
                }
                
                // Only include fields that have values
                const draftData = {
                    category: values.category || '',
                    title: values.title || '',
                    slug: values.slug || '',
                    blogContent: values.blogContent || '',
                };
                
                formData.append('data', JSON.stringify(draftData));
                
                const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/drafts`, {
                    method: 'post',
                    credentials: 'include',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save draft');
                }
                
                setHasDraft(true);
            } catch (error) {
                console.error('Error saving draft:', error);
                setSaveError('Failed to save draft. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }, 2000), // 2 second debounce
        [file, user.isLoggedIn]
    );

    // Watch form values for changes and trigger auto-save
    useEffect(() => {
        const subscription = form.watch((values) => {
            if (values.title || values.category || values.blogContent) {
                autoSaveDraft(values);
            }
        });
        
        return () => subscription.unsubscribe();
    }, [autoSaveDraft]);

    async function onSubmit(values) {
        try {
            const newValues = { ...values, author: user.user._id }
            if (!file) {
                showToast('error', 'Feature image required.')
                return;
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('data', JSON.stringify(newValues))

            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/blog/add`, {
                method: 'post',
                credentials: 'include',
                body: formData
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            
            // Delete the draft after successful blog submission
            try {
                await fetch(`${getEvn('VITE_API_BASE_URL')}/drafts`, {
                    method: 'delete',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Error deleting draft:', error);
            }
            
            form.reset()
            setFile(null)
            setPreview('')
            navigate(RouteBlog)
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    const handleFileSelection = (files) => {
        if (files && files.length > 0) {
            const file = files[0]
            const preview = URL.createObjectURL(file)
            setFile(file)
            setPreview(preview)
        }
    }

    return (
        <div>
            <Card className="pt-5">
                <CardContent>
                    <h1 className='text-2xl font-bold mb-4'>Add Blog</h1>
                    {hasDraft && (
                        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                            <p>You have a draft. Your changes are being saved automatically.</p>
                        </div>
                    )}
                    {saveError && (
                        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
                            <p>{saveError}</p>
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}  >
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryData && categoryData.category.length > 0 &&
                                                            categoryData.category.map(category => (
                                                                <SelectItem key={category._id} value={category._id}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter blog title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <span className='mb-2 block'>Featured Image</span>
                                <Dropzone onDrop={acceptedFiles => handleFileSelection(acceptedFiles)}>
                                    {({ getRootProps, getInputProps }) => (
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <div className='flex justify-center items-center w-36 h-28 border-2 border-dashed rounded'>
                                                {filePreview ? (
                                                    <img src={filePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-gray-500">Drop image here</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Dropzone>
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="blogContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blog Content</FormLabel>
                                            <FormControl>
                                                <Editor props={{ initialData: field.value, onChange: handleEditorData }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Submit'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddBlog