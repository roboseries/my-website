"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlayCircle, Search, User } from "lucide-react";
import { motion } from "framer-motion";

interface Concept {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setLoadingConcepts(true);
      fetch("http://localhost:4000/concepts", {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch concepts");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setConcepts(data);
          } else {
            setConcepts([]);
            console.error("Concepts data is not an array:", data);
          }
        })
        .catch((error) => {
          console.error(error);
          setConcepts([]);
        })
        .finally(() => setLoadingConcepts(false));
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setLoginError(null);
    fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        setIsLoggedIn(true);
        setShowLogin(false);
      })
      .catch((err) => {
        console.error(err);
        setLoginError("Invalid email or password");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white px-6 py-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-blue-400">Robu Series</h1>
        {!isLoggedIn && (
          <Button onClick={() => setShowLogin(true)} className="bg-blue-500 hover:bg-blue-600">
            <User className="mr-2 w-4 h-4" />
            Login
          </Button>
        )}
      </header>

      {!isLoggedIn && showLogin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mt-4 bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Login to Continue</h2>
          <Input
            placeholder="Email"
            className="mb-4 bg-gray-700 border-none text-white placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            className="mb-2 bg-gray-700 border-none text-white placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError && (
            <p className="text-red-500 text-sm mb-4">{loginError}</p>
          )}
          <Button onClick={handleLogin} className="w-full py-2 rounded-xl">
            Login
          </Button>
        </motion.div>
      )}

      {!isLoggedIn && !showLogin && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mt-24 max-w-3xl mx-auto"
        >
          <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Welcome to Robu Series
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Your gateway to learning Embedded Systems, Microcontrollers, Real-Time Projects,
            and Electronics — all in one place. Dive into interactive videos, explanations, and visual content to become a hardware/software pro!
          </p>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              onClick={() => setShowLogin(true)}
              className="px-6 py-3 text-lg rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.section>
      )}

      {isLoggedIn && (
        <>
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-4">
                Access All Learning Materials
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto">
                Structured tutorials, guides, and theories across embedded topics.
              </p>
            </motion.div>
          </section>

          <section className="grid md:grid-cols-3 gap-6">
            {loadingConcepts ? (
              <p className="text-center col-span-full text-gray-400">
                Loading concepts...
              </p>
            ) : concepts.length > 0 ? (
              concepts.map((topic) => (
                <Card
                  key={topic.id}
                  className="bg-gray-800 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <PlayCircle className="w-8 h-8 text-blue-400" />
                      <h3 className="text-xl font-semibold">{topic.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{topic.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-400">
                No concepts found.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
