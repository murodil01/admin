import logo from "../../assets/logo.png";
import mlogo from "../../assets/mlogo.svg";
import { Form, Input, Button } from "antd";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  backgroundColor: "#1F2937",
  color: "white",
  height: "40px",
  fontSize: "18px",
  fontWeight: "500",
  border: "none",
};

const buttonHoverStyle = {
  backgroundColor: "#111827",
  color: "white",
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (/*values*/) => {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("token", "fake-token"); // 👈 bu muhim
      navigate("/");
    }, 1500);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="bg-[#1F2937] hidden md:flex md:w-1/2 flex-col items-center justify-center p-8">
        <img src={logo} alt="Logo" className="w-32 md:w-[380px] mb-6" />
        <h1 className="text-white font-bold text-4xl md:text-5xl">Company</h1>
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center p-6 bg-white">
        <div className="w-[452px] max-w-md">
          <img
            src={mlogo}
            alt="Mobile Logo"
            className="block md:hidden mx-auto mt-10 mb-8"
          />

          <h2
            style={{ color: "#000", fontSize: "28px", fontWeight: 600 }}
            className="text-center mb-8"
          >
            Login to the PROTOTYPE System{" "}
          </h2>

          <Form name="login" layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
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
