"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export function SimpleFooterWithFourGrids() {
  const products = [
    {
      title: "Analysis Tools",
      href: "#",
    },
    {
      title: "Visualization",
      href: "#",
    },
    {
      title: "Export",
      href: "#",
    },
  ];

  const resources = [
    {
      title: "Documentation",
      href: "#",
    },
    {
      title: "Tutorials",
      href: "#",
    },
    {
      title: "API",
      href: "#",
    },
  ];

  const company = [
    {
      title: "About",
      href: "#",
    },
    {
      title: "Contact",
      href: "#",
    },
    {
      title: "Blog",
      href: "#",
    },
  ];

  const legal = [
    {
      title: "Privacy Policy",
      href: "#",
    },
    {
      title: "Terms of Service",
      href: "#",
    },
    {
      title: "Security",
      href: "#",
    },
  ];

  return (
    <div className="border-t border-primary/20 px-8 py-20 bg-[#0A0F17] w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto text-sm text-white flex sm:flex-row flex-col justify-between items-start md:px-8">
        <div>
          <div className="mr-0 md:mr-4 md:flex mb-4">
            <Logo />
          </div>

          <div className="mt-2 ml-2 text-muted">
            &copy; copyright MolecularDynamics 2024. All rights reserved.
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 items-start mt-10 sm:mt-0 md:mt-0">
          <div className="flex justify-center space-y-4 flex-col w-full border-l border-primary/10 pl-4">
            <p className="text-white font-[var(--font-display)] font-bold">
              Product
            </p>
            <ul className="text-white list-none space-y-4">
              {products.map((item, idx) => (
                <li key={"product" + idx} className="list-none">
                  <Link
                    className="text-accent hover:text-accent/80 transition-colors font-[var(--font-body)]"
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center space-y-4 flex-col border-l border-primary/10 pl-4">
            <p className="text-white font-[var(--font-display)] font-bold">
              Resources
            </p>
            <ul className="text-white list-none space-y-4">
              {resources.map((item, idx) => (
                <li key={"resource" + idx} className="list-none">
                  <Link
                    className="text-accent hover:text-accent/80 transition-colors font-[var(--font-body)]"
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center space-y-4 flex-col border-l border-primary/10 pl-4">
            <p className="text-white font-[var(--font-display)] font-bold">
              Company
            </p>
            <ul className="text-white list-none space-y-4">
              {company.map((item, idx) => (
                <li key={"company" + idx} className="list-none">
                  <Link
                    className="text-accent hover:text-accent/80 transition-colors font-[var(--font-body)]"
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center space-y-4 flex-col border-l border-primary/10 pl-4">
            <p className="text-white font-[var(--font-display)] font-bold">
              Legal
            </p>
            <ul className="text-white list-none space-y-4">
              {legal.map((item, idx) => (
                <li key={"legal" + idx} className="list-none">
                  <Link
                    className="text-accent hover:text-accent/80 transition-colors font-[var(--font-body)]"
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm mr-4 text-white px-2 py-1 relative z-20 font-[var(--font-body)]"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">MD</span>
      </div>
    </Link>
  );
};
