// pages/discussion.js
'use client';
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import axios from 'axios';
import ArticlePopup from "../components/Popup";


import Navbar from "../components/Navbar";
 
const Footer = dynamic(() => import('../components/Footer'), { ssr: false })
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";


import { useRouter } from "next/navigation";


const Discussion = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articles, setArticles] = useState([]);
  const [isFormVisible, setFormVisibility] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null); // New state for the selected article
  const { data: session } = useSession();

  const openForm = () => {
    setFormVisibility(true);
  };

  const closeForm = () => {
    setFormVisibility(false);
  };

  const submitArticle = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    const newArticle = {
      title: title.trim(),
      content: content.trim(),
      author: session ? session.user.name : "Anonymous",
    };

    try {
      // Make a POST request to your API endpoint
      const response = await axios.post('/api/article/', newArticle);

      // Update the state with the response from the server
      setArticles(response.data.articles);

      // Reset form fields and close the form
      setTitle("");
      setContent("");
      closeForm();
      window.location.reload();
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('Error submitting article. Please try again.');
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Make a GET request to your API endpoint
        const response = await axios.get('/api/article/');
        
        // Update the state with the articles array from the response
        setArticles(response.data.articles);
        
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };
  
    fetchArticles();
  }, []);

  const router = useRouter();
  const {data,status} = useSession();

  if(status === "unauthenticated"){
      router.push("/login");
  }

  return (
    <>
      <Navbar />
      <div className="max-w-[100%] ml-4 p-4 text-white text-left">
        <div className="flex justify-between items-center">
          <button
            className="bg-green-500 text-white px-4 py-2 my-5 z-10 rounded"
            onClick={openForm}
          >
            Add Article
          </button>
        </div>

        {isFormVisible && (
          <div className="bg-white p-4 mt-4 mb-5 rounded-3xl fixed right-7 top-[10%] w-[45%] h-[75%] z-50 mob:w-[94%] mob:right-3 mob:h-[88vh]">
            <h2 className="text-xl text-black font-bold mb-4">Add Article</h2>
            <form id="submitForm" className="flex flex-col">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Heart Health"
                required
              />

              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-3"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="13"
                autoCorrect="on"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Leave a comment..."
                required
              ></textarea>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={submitArticle}
                  className="bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 text-white px-4 py-2 rounded mt-5"
                >
                  Submit Article
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-red-500 text-black px-4 py-2 rounded mt-5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div id="articles" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
          {articles.map((article, index) => (
            <div key={index} className="max-w-2xl p-4 mb-4 bg-pink-300 rounded shadow-md">
              <Card
                className="w-full max-w-[48rem] bg-red-200 flex-row max-h-[40vh] overflow-y-auto cursor-pointer des:min-h-[27vh]"
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader
                  shadow={false}
                  floated={false}
                  className="m-0 w-2/5 shrink-0 rounded-r-none"
                >
                  <img
                    src={`https://source.unsplash.com/1080x900/?${article.title}`}
                    alt="card-image"
                    className="h-full w-full object-cover"
                  />
                </CardHeader>
                <CardBody>
                  <Typography variant="h4" color="blue-gray" className="mb-2">
                    {article.title}
                  </Typography>
                  <Typography color="gray" className="mb-8 font-normal">
                    {article.author}
                  </Typography>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>

        <ArticlePopup
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />

      </div>
      <Footer />
    </>
  );
};

export default Discussion;
