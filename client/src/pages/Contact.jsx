import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { api } from '../api/axiosInstance';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        company: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/contact', formData);
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting API:', error);
            alert('Could not send message. Ensure backend is running.');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-900 pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-bold tracking-wide uppercase mb-6 backdrop-blur-sm">Contact Sales</span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Let's Build Your Team</h1>
                    <p className="text-xl text-slate-300">
                        Ready to upskill your workforce? Our enterprise solutions are tailored to your company's needs.
                        Get in touch for custom pricing and demos.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Chat with Sales</h3>
                            <p className="text-slate-500 mb-4">Speak to our friendly team.</p>
                            <a href="mailto:ayushraj1y2@gmail.com" className="font-bold text-blue-600 hover:text-blue-700">ayushraj1y2@gmail.com</a>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Visit our Office</h3>
                            <p className="text-slate-500 mb-4">We are operating fully remote.</p>
                            <p className="font-bold text-slate-900">Physical HQ coming soon<br />Stay tuned!</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                                <Phone className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Call Us</h3>
                            <p className="text-slate-500 mb-4">Mon-Fri from 8am to 5pm.</p>
                            <a href="tel:9905614718" className="font-bold text-purple-600 hover:text-purple-700">+91 9905614718</a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-8 md:p-12">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                                        <Send className="h-10 w-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h2>
                                    <p className="text-slate-500 max-w-md">
                                        Thanks for reaching out. A member of our sales team will get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-8 text-primary font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                                placeholder="john@company.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                            placeholder="Acme Inc."
                                            value={formData.company}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">How can we help?</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="4"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Tell us about your team's training needs..."
                                            value={formData.message}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
