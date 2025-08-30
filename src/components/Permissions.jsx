import React, { memo } from "react";
import { useAuth } from "../hooks/useAuth";

export const Permission = memo(({ children, anyOf = [], className, ...rest }) => {
  const { user, loading } = useAuth();

  // loading yoki user bo'lmasa hech narsa ko'rsatilmaydi
  if (loading || !user) return null;

  const userRole = String(user.role || "").toLowerCase();

  // anyOf bo'sh array bo'lsa -> ochiq (haqiqiy holatingizga qarab o'zgartiring)
  const allowed =
    Array.isArray(anyOf) && anyOf.length > 0
      ? anyOf.some((r) => String(r || "").toLowerCase() === userRole)
      : true;

  if (!allowed) return null;

  // agar children bitta React element bo'lsa -> propslarni unga clone qilamiz va className'ni birlashtiramiz
  if (React.isValidElement(children)) {
    const childClass = children.props?.className || "";
    const mergedClass = [childClass, className].filter(Boolean).join(" ").trim();

    const childProps = {
      ...rest,
      ...(mergedClass ? { className: mergedClass } : {}),
    };

    return React.cloneElement(children, childProps);
  }

  // agar children ko'p element bo'lsa yoki string bo'lsa -> o'rab qo'yamiz.
  // Eslatma: bu ba'zi styling holatlarni o'zgartirishi mumkin — ideal variant: bitta child yuboring.
  return (
    <div {...rest} className={className}>
      {children}
    </div>
  );
});
