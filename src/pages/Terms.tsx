import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
          
          <div className="space-y-8">
            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using SIMANA, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily use SIMANA for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on SIMANA</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
              <p className="text-muted-foreground">
                The materials on SIMANA are provided on an 'as is' basis. SIMANA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
              <p className="text-muted-foreground">
                In no event shall SIMANA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SIMANA.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">5. Accuracy of Materials</h2>
              <p className="text-muted-foreground">
                The materials appearing on SIMANA could include technical, typographical, or photographic errors. SIMANA does not warrant that any of the materials on its website are accurate, complete or current. SIMANA may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
              <p className="text-muted-foreground">
                SIMANA has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by SIMANA of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
              <p className="text-muted-foreground">
                SIMANA may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="glass rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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

export default Terms; 