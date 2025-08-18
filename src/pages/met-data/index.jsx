import { Helmet } from "react-helmet-async";

const HelmetPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - My App</title>
        <meta name="description" content="This is the about page of My App" />
      </Helmet>

      <div>
        <h1>About Page</h1>
        <p>Bu sahifa haqida ma’lumot beradi.</p>
      </div>
    </>
  );
};

export default HelmetPage;
