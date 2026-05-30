import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="flex items-center gap-2 text-white font-bold text-2xl">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <span className="font-display text-xl">T</span>
                            </div>
                            <span className="font-display tracking-tight">TMS Platform</span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Empowering the next generation of tech leaders through accessible, high-quality education. Join our community of 10,000+ learners today.
                        </p>
                        <div className="flex gap-4 pt-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-slate-800 hover:border-primary group">
                                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-white font-bold text-lg">Platform</h3>
                        <ul className="space-y-4">
                            <li><Link to="/courses" className="hover:text-primary transition-colors flex items-center group">Browse Courses <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                            <li><Link to="/live-classes" className="hover:text-primary transition-colors">Live Workshops</Link></li>
                            <li><Link to="/mentorship" className="hover:text-primary transition-colors">Find a Mentor</Link></li>
                            <li><Link to="/resources" className="hover:text-primary transition-colors">Resource Library</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-white font-bold text-lg">Company</h3>
                        <ul className="space-y-4">
                            <li><Link to="/about-us" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Press Kit</a></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Sales</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-white font-bold text-lg">Stay Updated</h3>
                        <p className="text-sm text-slate-500">Subscribe to our newsletter for the latest updates and free resources.</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 w-full text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-bold transition-colors">
                                Subscribe
                            </button>
                        </form>
                        <div className="pt-4 border-t border-slate-900">
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                <Mail className="h-4 w-4" /> support@tms.com
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="h-4 w-4" /> 100 Tech Park, San Francisco
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} TMS Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
