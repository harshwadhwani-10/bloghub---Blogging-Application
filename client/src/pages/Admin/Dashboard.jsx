import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getEvn } from '@/helpers/getEnv'
import { showToast } from '@/helpers/showToast'
import { useNavigate } from 'react-router-dom'
import { RouteIndex } from '@/helpers/RouteName'
import { useSelector } from 'react-redux'
import { FileDown, FileText, FileSpreadsheet, FileType } from 'lucide-react'

const Dashboard = () => {
    const navigate = useNavigate()
    const { user } = useSelector(state => state.user)
    const [stats, setStats] = useState({
        totalBlogs: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalLikes: 0
    })
    const [categoryData, setCategoryData] = useState([])
    const [userTrendData, setUserTrendData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate(RouteIndex)
            return
        }
        fetchDashboardData()
    }, [user])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/admin/dashboard`, {
               credentials: 'include'
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch dashboard data')
            }
            setStats(data.stats || stats)
            setCategoryData(data.categoryData || [])
            setUserTrendData(data.userTrendData || [])
        } catch (error) {
            console.error('Dashboard data fetch error:', error)
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadReport = async (type, format) => {
        try {
            const response = await fetch(`${getEvn('VITE_API_BASE_URL')}/admin/download-report/${type}/${format}`, {
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Failed to download report')
            }
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${type}-report.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Report download error:', error)
            showToast('error', error.message)
        }
    }

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <h3 className="text-lg font-semibold">Total Blogs</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalBlogs}</p>
                </Card>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
                </Card>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <h3 className="text-lg font-semibold">Total Categories</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalCategories}</p>
                </Card>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                    <h3 className="text-lg font-semibold">Total Likes</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalLikes}</p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="p-6 shadow-lg bg-white">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Blogs by Category</h3>
                    <div className="h-[400px] w-full max-w-[600px] mx-auto">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={categoryData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        interval={0}
                                        stroke="#6b7280"
                                    />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500">No category data available</p>
                            </div>
                        )}
                    </div>
                </Card>
                <Card className="p-6 shadow-lg bg-white">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">User Registration Trend</h3>
                    <div className="h-[400px] w-full max-w-[600px] mx-auto">
                        {userTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    data={userTrendData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="month" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        stroke="#6b7280"
                                    />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500">No user trend data available</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Reports */}
            <div className="space-y-6">
                <Card className="p-6 shadow-lg bg-white">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Category Report</h3>
                    <div className="flex flex-wrap gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('category', 'pdf')}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                        >
                            <FileText size={16} />
                            Download PDF
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('category', 'excel')}
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        >
                            <FileSpreadsheet size={16} />
                            Download Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('category', 'word')}
                            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
                        >
                            <FileType size={16} />
                            Download Word
                        </Button>
                    </div>
                </Card>
                <Card className="p-6 shadow-lg bg-white">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">User Report</h3>
                    <div className="flex flex-wrap gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('user', 'pdf')}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                        >
                            <FileText size={16} />
                            Download PDF
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('user', 'excel')}
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        >
                            <FileSpreadsheet size={16} />
                            Download Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('user', 'word')}
                            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
                        >
                            <FileType size={16} />
                            Download Word
                        </Button>
                    </div>
                </Card>
                <Card className="p-6 shadow-lg bg-white">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Blog Report</h3>
                    <div className="flex flex-wrap gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('blog', 'pdf')}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                        >
                            <FileText size={16} />
                            Download PDF
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('blog', 'excel')}
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        >
                            <FileSpreadsheet size={16} />
                            Download Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleDownloadReport('blog', 'word')}
                            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
                        >
                            <FileType size={16} />
                            Download Word
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard 