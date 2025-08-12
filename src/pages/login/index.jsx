import logo_blue from "../../assets/logo_blue.png";
import { Form, Input, Button } from "antd";
import { Loader, Mail, Lock } from "lucide-react";
import { useState } from "react";
import request from "../../api/request";
import { useNavigate } from "react-router-dom";
import side_blue3 from "../../assets/side_blue3.png";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await request({
        url: "/token/",
        method: "POST",
        body: { email, password },
      });

      localStorage.setItem("token", res.data.access);
      toast.success("Login muvaffaqiyatli!");
      navigate("/");
    } catch (err) {
      toast.error(
        "Login xatoligi: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col md:flex-row min-h-screen w-full overflow-y-auto">
        {/* Left Side */}
        <div className="bg-[#0061fe] hidden md:flex md:w-1/2 flex-col items-center justify-center p-4">
          <img
            src={logo_blue}
            alt="Logo"
            className="w-24 md:w-[250px] mb-4 object-contain"
          />
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <img
              src={side_blue3}
              alt="Mobile Logo"
              className="block w-14 md:hidden mx-auto mt-6 mb-6 object-contain"
            />

            <h2
              className="text-center mb-6"
              style={{ color: "#000", fontSize: "24px", fontWeight: 600 }}
            >
              Welcome to PROTOTYPE
            </h2>

            <Form
              name="login"
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
            >
              {/* Email */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#9A9A9A" }}>
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                ]}
              >
                <Input
                  prefix={
                    <Mail
                      size={18}
                      color={focusedField === "email" ? "#0061fe" : "#9A9A9A"}
                      style={{ marginRight: 8 }}
                    />
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "10px",
                  }}
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#9A9A9A" }}>
                    Password
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                ]}
              >
                <Input.Password
                  prefix={
                    <Lock
                      size={18}
                      color={
                        focusedField === "password" ? "#0061fe" : "#9A9A9A"
                      }
                      style={{ marginRight: 8 }}
                    />
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "10px",
                  }}
                />
              </Form.Item>

              {/* Submit */}
              <Form.Item>
                <Button
                  className="mt-4"
                  htmlType="submit"
                  block
                  disabled={loading}
                  style={{
                    backgroundColor: "#0061fe",
                    color: "#fff",
                    height: "50px",
                    fontSize: "16px",
                    fontWeight: "500",
                    border: "none",
                    borderRadius: "10px",
                  }}
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
    </>
  );
};

export default Login;
