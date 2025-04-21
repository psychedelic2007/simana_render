import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us, including when you use our services, upload files, or contact us. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Files you upload for analysis</li>
                <li>Contact information when you reach out to us</li>
                <li>Usage data and preferences</li>
                <li>Technical information about your device and browser</li>
              </ul>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and improve our services</li>
                <li>Process and analyze your uploaded files</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send you updates and notifications about our services</li>
                <li>Monitor and analyze usage patterns</li>
              </ul>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your uploaded files and analysis results only for as long as necessary to provide our services and as required by applicable laws. You can request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We may use third-party services to help us operate our website and deliver our services. These third parties have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at compobelisk1@gmail.com.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
      <div className="mb-32"></div>
      <Footer />
    </div>
  );
};

export default Privacy; 