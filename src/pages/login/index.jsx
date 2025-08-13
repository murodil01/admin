import logo_blue from "../../assets/logo_blue.png";
import { Form, Input, Button } from "antd";
import { Loader, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import request from "../../api/request";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mobileLeftHeight, setMobileLeftHeight] = useState("100vh");
  const [mobileRightVisible, setMobileRightVisible] = useState(false);
  const isMobile = window.innerWidth < 768; // faqat bir marta aniqlanadi
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

  // AOS faqat mobile uchun
  useEffect(() => {
    if (isMobile) {
      AOS.init({ duration: 800, once: true });
    }
  }, [isMobile]);

  // Mobile left side height animatsiyasi
  useEffect(() => {
    if (isMobile) {
      let height = 100;
      const interval = setInterval(() => {
        height -= 2;
        if (height <= 25) {
          height = 25;
          clearInterval(interval);
          setMobileRightVisible(true);
        }
        setMobileLeftHeight(height + "vh");
      }, 28);
      return () => clearInterval(interval);
    } else {
      // Desktop — animatsiya yo'q
      setMobileLeftHeight("auto");
      setMobileRightVisible(true);
    }
  }, [isMobile]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className="flex flex-col  bg-[#0061fe] md:flex-row min-h-screen w-full overflow-hidden"
        {...(isMobile ? { "data-aos": "fade-zoom-in" } : {})}
      >
        {/* Left Side */}
        <div
          className="bg-[#0061fe] flex items-center justify-center p-4 transition-all duration-700 ease-in-out md:h-auto md:w-1/2"
          style={{ height: mobileLeftHeight }}
        >
          <img
            src={logo_blue}
            alt="Logo"
            className="w-20 md:w-[250px] mb-4 object-contain"
          />
        </div>

        {/* Right Side */}
        <div
          className="flex-1 rounded-t-[30px] md:rounded-t-none flex items-center justify-center p-4 sm:p-6 bg-white"
          style={
            isMobile
              ? {
                  opacity: mobileRightVisible ? 1 : 0,
                  transform: mobileRightVisible
                    ? "translateY(0)"
                    : "translateY(24px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                }
              : {} // desktopda style bo'sh → animatsiya yo'q
          }
        >
          <div className="w-full max-w-md">
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
                  autoComplete="email" // ✅ qo‘shildi
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "10px",
                  }}
                />
              </Form.Item>

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
                  autoComplete="current-password" // ✅ qo‘shildi
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    borderRadius: "10px",
                  }}
                />
              </Form.Item>

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
