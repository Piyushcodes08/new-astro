import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Helmet } from "react-helmet-async";

const slugify = (text) =>
  text?.toLowerCase().replace(/[^؀-ۿ\w ]+/g, "").replace(/ +/g, "-");

const ArticlesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const articlesQuery = query(
        collection(db, "Articles")
      );
      const querySnapshot = await getDocs(articlesQuery);

      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        slug: slugify(doc.data().title),
        ...doc.data(),
      }));

      // Sort client-side: support createdAt (Firestore Timestamp), timestamp, or data (string date)
      fetchedData.sort((a, b) => {
        const getTime = (item) => {
          if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
          if (item.timestamp?.seconds) return item.timestamp.seconds * 1000;
          if (item.data) return new Date(item.data).getTime();
          return 0;
        };
        return getTime(b) - getTime(a);
      });

      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const getMetaTags = () => {

    return (
      <Helmet>
        <title>Astrology Articles by Valay Patel</title>
        <meta name="description" content={''} />
        <meta
          name="keywords"
          content={''}
        />
      </Helmet>

    );
  };

  return (
    <div
      className="bg-gray-50 min-h-screen text-sm"
      style={{ backgroundImage: "url('https://res.cloudinary.com/dzdnwpocf/image/upload/v1753466267/articalsbg_zjtb2m.jpg')" }}
    >
      {getMetaTags()}
      <div className="bg-cover bg-center h-48 flex items-center justify-center shadow-md">
        <h1 className="text-xl md:text-4xl font-bold text-black">
          Articles & Publications
        </h1>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-8 lg:flex lg:space-x-6">
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((article, index) => (
              <Link to={`/article/${article.slug}`} key={index}>
                <div className="md:w-64 w-72 md:left-0 left-7 bg-white shadow-md rounded-lg overflow-hidden relative">
                  <div className="relative">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt="Article"
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="absolute -bottom-6 left-2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                      <img
                        src="/src/assets/images/common/logos/vahlay_astro.png"
                        alt="logo"
                        className="w-10 h-10 object-contain rounded-full"
                      />
                    </div>
                  </div>

                  <div className="p-4 flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 my-3">
                      {article.title?.substring(0, 40)}...
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {article.hindi?.substring(0, 80)}...
                    </p>
                    <div className="mt-auto pt-4">
                      <Link
                        to={`/article/${article.slug}`}
                        className="text-red-600 text-sm font-semibold hover:underline"
                      >
                        Read More &gt;
                      </Link>
                      <div className="mt-2 text-gray-500 text-xs">
                        {article.author && <span>by {article.author} | </span>}
                        {article.data}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:w-1/4 mt-8 lg:mt-0">
          <div className="bg-white shadow-md rounded-lg p-6">
            <Link to="/courses">
              <button className="w-full bg-red-500 text-white py-2 rounded-lg mb-4">
                Courses
              </button>
            </Link>
            <button className="w-full bg-red-500 text-white py-2 rounded-lg">
              Books
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Articles</h3>
            <ul className=" list-disc space-y-2 text-sm mx-2">
              {data.map((article, index) => (
                <li key={index}>
                  <Link
                    to={`/article/${article.slug}`}
                    className="text-red-600 mb-5"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;


