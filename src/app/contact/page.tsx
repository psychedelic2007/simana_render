"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageCircle, Clock, Users, Send } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form after successful submission
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
    
    // Here you would typically handle the actual form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden pt-24">
      {/* Scenic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-purple-600/10" />
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-accent/5 to-transparent" />
      
      {/* Floating Geometric Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full animate-pulse" />
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg rotate-45 animate-bounce" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-32 left-16 w-40 h-40 border border-accent/20 rounded-lg rotate-12 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full animate-bounce" style={{ animationDuration: '8s', animationDelay: '1s' }} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 container mx-auto px-6 py-24 max-w-7xl"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-24">
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent mb-6">
            Contact SIMANA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with our team of experts to discuss your simulation needs and discover how SIMANA can accelerate your research and development processes.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-24">
          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card/30 backdrop-blur-lg border-border/50 hover:bg-card/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <Send className="w-6 h-6 text-primary" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  We typically respond within 24 hours during business days.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        className={`bg-background/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all duration-200 ${
                          errors.name ? 'border-destructive' : ''
                        }`}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className={`bg-background/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all duration-200 ${
                          errors.email ? 'border-destructive' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Input
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleInputChange('subject')}
                      className={`bg-background/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all duration-200 ${
                        errors.subject ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                    )}
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Tell us about your simulation requirements, questions, or how we can assist you..."
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      rows={6}
                      className={`bg-background/50 border-border/50 focus:border-accent focus:ring-accent/20 transition-all duration-200 resize-none ${
                        errors.message ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Message...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Primary Contact */}
            <Card className="bg-card/30 backdrop-blur-lg border-border/50 hover:bg-card/40 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-200" />
                  General Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <span>info@simana.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  For general questions, partnership inquiries, and business development.
                </p>
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card className="bg-card/30 backdrop-blur-lg border-border/50 hover:bg-card/40 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-200" />
                  Technical Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <span>support@simana.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <span>+1 (555) 123-4568</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>24/7 Support Available</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Dedicated technical assistance for SIMANA platform users and integration support.
                </p>
              </CardContent>
            </Card>

            {/* Office Location */}
            <Card className="bg-card/30 backdrop-blur-lg border-border/50 hover:bg-card/40 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-200" />
                  Headquarters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 mt-1" />
                  <div>
                    <p>123 Innovation Drive</p>
                    <p>Silicon Valley, CA 94025</p>
                    <p>United States</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Visit our state-of-the-art research facility and meet our simulation experts.
                </p>
              </CardContent>
            </Card>

            {/* Research Team */}
            <Card className="bg-card/30 backdrop-blur-lg border-border/50 hover:bg-card/40 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-200" />
                  Research Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <span>research@simana.com</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Connect with our research team for academic partnerships, collaborative projects, and cutting-edge simulation research opportunities.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          variants={itemVariants}
          className="mt-24 text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-600/10 to-accent/10 border border-border/50"
        >
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Ready to Transform Your Simulations?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Schedule a personalized demonstration to see how SIMANA's advanced simulation platform can accelerate your research and development workflows.
          </p>
          <Button 
            className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-background font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105"
          >
            Schedule a Demo
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
