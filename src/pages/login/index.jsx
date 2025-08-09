// import logo from "../../assets/logo.png";
// import mlogo from "../../assets/mlogo.svg";
import logo_blue from "../../assets/logo_blue.png"
import { Form, Input, Button } from "antd";
import { Loader } from "lucide-react";
import { useState } from "react";
import request from "../../api/request";
import { useNavigate } from "react-router-dom";
import side_blue3 from "../../assets/side_blue3.png"

const inputStyle = {
  height: "40px",
  fontSize: "16px",
  borderColor: "#d9d9d9",
};

const inputFocusStyle = {
  borderColor: "#9CA3AF",
  boxShadow: "none",
};

const buttonStyle = {
  backgroundColor: "#0061fe",
  color: "white",
  height: "40px",
  fontSize: "18px",
  fontWeight: "500",
  border: "none",
};

const buttonHoverStyle = {
  backgroundColor: "#0061fe",
  color: "white",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // e.preventDefault();
    setLoading(true);
    try {
      const res = await request({
        url: "/token/",
        method: "POST",
        body: {
          email,
          password,
        },
      });

      localStorage.setItem("token", res.data.access);
      // localStorage.setItem("token", res.data.token);
      alert("Login muvaffaqiyatli!");
      navigate("/"); // yoki kerakli yo‘l
    } catch (err) {
      alert("Login xatoligi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="bg-[#0061fe] hidden md:flex md:w-1/2 flex-col items-center justify-center p-8">
        <img src={logo_blue} alt="Logo" className="w-32 md:w-[280px] mb-6" />
        {/* <h1 className="text-white font-bold text-4xl md:text-5xl">Company</h1> */}
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center p-6 bg-white">
        <div className="w-[452px] max-w-md">
          <img
            src={side_blue3}
            alt="Mobile Logo"
            className="block w-15 md:hidden mx-auto mt-20 mb-8"
          />

          <h2
            style={{ color: "#000", fontSize: "28px", fontWeight: 600 }}
            className="text-center mb-8"
          >
            Welcome to PROTOTYPE
          </h2>

          <Form name="login" layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
               value={email}
               onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = inputFocusStyle.borderColor)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = inputStyle.borderColor)
                }
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
              ]}
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = inputFocusStyle.borderColor)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = inputStyle.borderColor)
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                className="mt-5 md:mt-7"
                htmlType="submit"
                style={{
                  ...buttonStyle,
                  backgroundColor: loading
                    ? buttonStyle.backgroundColor
                    : buttonStyle.backgroundColor,
                }}
                block
                disabled={loading}
                onMouseOver={(e) =>
                  !loading &&
                  (e.currentTarget.style.backgroundColor =
                    buttonHoverStyle.backgroundColor)
                }
                onMouseOut={(e) =>
                  !loading &&
                  (e.currentTarget.style.backgroundColor =
                    buttonStyle.backgroundColor)
                }
              >
                {loading ? (
                  <Loader className="animate-spin mx-auto" size={22} />
                ) : (
                  "Enter"
                )}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
