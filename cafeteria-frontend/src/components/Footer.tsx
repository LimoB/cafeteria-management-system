import React, { forwardRef } from "react";

const Footer = forwardRef((_, ref) => (
  <footer ref={ref} className="bg-gray-50 border-t text-gray-700 px-6 py-16 mt-20 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-sm">
      {/* Platform */}
      <div>
        <h4 className="text-lg font-black text-primary mb-4 uppercase tracking-tighter">Laikipia Canteen</h4>
        <p className="text-gray-500 leading-relaxed">
          The official student meal ordering platform. Fast, secure, and reliable.
        </p>
      </div>

      {/* Services */}
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Quick Links</h4>
        <ul className="space-y-2 text-gray-600">
          <li><a href="#" className="hover:text-primary transition-all">Order Tracking</a></li>
          <li><a href="#" className="hover:text-primary transition-all">Pickup Points</a></li>
          <li><a href="#" className="hover:text-primary transition-all">Report Issue</a></li>
        </ul>
      </div>

      {/* Dev Team */}
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Development</h4>
        <ul className="space-y-2 text-gray-600">
          <li>Built by <span className="font-bold text-gray-800">Boaz Limo</span></li>
          <li>Full Stack Architecture</li>
          <li>Kali Linux Environment</li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-base font-bold text-gray-900 mb-4">Support</h4>
        <ul className="space-y-2 text-gray-600">
          <li>Main Campus, Student Center</li>
          <li><a href="mailto:canteen.support@laikipia.ac.ke" className="text-primary hover:underline">canteen.support@laikipia.ac.ke</a></li>
          <li>+254 712 345 678</li>
        </ul>
      </div>
    </div>

    <div className="mt-12 pt-6 text-center text-xs text-gray-400 border-t border-gray-200">
      <p>&copy; {new Date().getFullYear()} Laikipia Canteen System. All rights reserved.</p>
      <p className="mt-1">Hand-crafted with 💻 by <span className="text-primary font-medium">Limo Limo</span></p>
    </div>
  </footer>
));

Footer.displayName = "Footer";
export default Footer;