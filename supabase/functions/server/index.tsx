import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import nodemailer from "npm:nodemailer";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const gmailTransporter = (() => {
  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
    requireTLS: true,
  });
})();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ==================== EMAIL HELPER ====================

async function sendEmail(to: string, subject: string, html: string) {
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
  const mailFrom = Deno.env.get("MAIL_FROM") || Deno.env.get("FROM_EMAIL") || "HaFi Serve Rwanda <hafiserve.rw@gmail.com>";

  if (gmailUser && gmailAppPassword) {
    console.log("📧 [EMAIL] Attempting Gmail SMTP for", to);
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: gmailUser, pass: gmailAppPassword },
        requireTLS: true,
      });

      const info = await transporter.sendMail({
        from: mailFrom,
        to,
        subject,
        html,
      });

      console.log("✅ [EMAIL] Successfully sent via Gmail SMTP to", to, "| MessageId:", info.messageId);
      return;
    } catch (err) {
      console.log("❌ [EMAIL] Gmail SMTP failed for", to, ":", err);
      console.log("⚠️ [EMAIL] Falling back to Resend if configured.");
    }
  } else {
    console.log("⚠️ [EMAIL] Gmail SMTP not configured. Falling back to Resend if available.");
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.log("❌ [EMAIL] RESEND_API_KEY environment variable not set! Cannot send email to:", to);
    console.log("⚠️  [EMAIL] To enable emails: Set GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_API_KEY in Supabase project secrets");
    console.log("📧 [EMAIL] Email would have gone to:", to);
    console.log("📧 [EMAIL] Subject:", subject);
    return;
  }

  try {
    const fromEmail = Deno.env.get("FROM_EMAIL") || "HaFi Serve Rwanda <onboarding@resend.dev>";
    if (!Deno.env.get("FROM_EMAIL")) {
      console.log("⚠️ [EMAIL] FROM_EMAIL not set, using resend.dev test sender. This only works for your own verified Resend email.");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });
    const data = await res.json();
    console.log("✅ [EMAIL] Successfully sent via Resend to", to, "| Status:", data.id || data.error || "SENT");
  } catch (err) {
    console.log("❌ [EMAIL] Error sending to", to, ":", err);
  }
}

// ==================== NOTIFICATION HELPER ====================

async function createNotification(targetEmail: string, title: string, message: string, type: string, linkPath?: string) {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const notif = {
    id,
    targetEmail,
    title,
    message,
    type,
    linkPath: linkPath || null,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`notif:${targetEmail}:${id}`, notif);
  return notif;
}

function formatWhatsApp(phone: string) {
  return `https://wa.me/${phone.replace(/[\s+\-()]/g, "")}`;
}

function emailOrderTemplate(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#16a34a,#2563eb);padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;">
        <h1 style="color:white;margin:0;font-size:22px;">🍽️ HaFi Serve Rwanda</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Order Before You Arrive. Enjoy Without Waiting.</p>
      </div>
      <div style="background:white;padding:24px;border-radius:8px;border:1px solid #e5e7eb;">
        <h2 style="color:#111827;margin-top:0;">${title}</h2>
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">HaFi Serve Rwanda 🇷🇼 — Serving near you</p>
    </div>
  `;
}

// ==================== MINE HOTEL SEED ====================

(async () => {
  try {
    const existing = await kv.get("hotel:4dd22e86-8330-48d2-8c19-10e2d27e1912");
    if (!existing) {
      await kv.set("hotel:4dd22e86-8330-48d2-8c19-10e2d27e1912", {
        id: "4dd22e86-8330-48d2-8c19-10e2d27e1912",
        name: "Mine",
        description: "my hotel",
        image: "historic-hotel-pool",
        rating: 5.0,
        totalReviews: 0,
        location: { address: "Ngororero, KABAYA", city: "Kabaya", district: "Ngororero", lat: 0, lng: 0 },
        contact: { phone: "+250 795 410 739", email: "Myhotel@gmail.com" },
        services: ["Free wi-fi", "Restaurant", "Coffee"],
        password: "123456",
      });
      console.log("✅ Mine hotel seeded into KV store");
    }
  } catch (e) {
    console.log("Mine hotel seed error (non-fatal):", e);
  }
})();

// ==================== HEALTH ====================

app.get("/make-server-47574933/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-47574933/email-debug", (c) => {
  return c.json({
    gmailUserConfigured: Boolean(Deno.env.get("GMAIL_USER")),
    gmailPasswordConfigured: Boolean(Deno.env.get("GMAIL_APP_PASSWORD")),
    mailFrom: Deno.env.get("MAIL_FROM") || Deno.env.get("FROM_EMAIL") || "HaFi Serve Rwanda <hafiserve.rw@gmail.com>",
    resendConfigured: Boolean(Deno.env.get("RESEND_API_KEY")),
  });
});

// ==================== AUTH ROUTES ====================

app.post("/make-server-47574933/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const user = await kv.get(`user:${email}`);
    if (!user || user.password !== password) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

app.get("/make-server-47574933/me", async (c) => {
  try {
    const email = c.req.header("X-User-Email");
    if (!email) return c.json({ error: "Not authenticated" }, 401);
    const user = await kv.get(`user:${email}`);
    if (!user) return c.json({ error: "User not found" }, 404);
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// ==================== USERS ROUTES ====================

app.get("/make-server-47574933/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ users });
  } catch (error) {
    console.log("Get users error:", error);
    return c.json({ error: "Failed to get users" }, 500);
  }
});

app.post("/make-server-47574933/users", async (c) => {
  try {
    const user = await c.req.json();
    const existingUser = await kv.get(`user:${user.email}`);
    if (existingUser) return c.json({ error: "User already exists" }, 400);
    await kv.set(`user:${user.email}`, user);
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log("Create user error:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

app.delete("/make-server-47574933/users/:email", async (c) => {
  try {
    const email = c.req.param("email");
    await kv.del(`user:${email}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete user error:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// ==================== HOTELS ROUTES ====================

app.get("/make-server-47574933/hotels", async (c) => {
  try {
    const hotels = await kv.getByPrefix("hotel:");
    return c.json({ hotels });
  } catch (error) {
    console.log("Get hotels error:", error);
    return c.json({ error: "Failed to get hotels" }, 500);
  }
});

app.get("/make-server-47574933/hotels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const hotel = await kv.get(`hotel:${id}`);
    if (!hotel) return c.json({ error: "Hotel not found" }, 404);
    return c.json({ hotel });
  } catch (error) {
    console.log("Get hotel error:", error);
    return c.json({ error: "Failed to get hotel" }, 500);
  }
});

app.post("/make-server-47574933/hotels", async (c) => {
  try {
    const hotel = await c.req.json();
    await kv.set(`hotel:${hotel.id}`, hotel);
    return c.json({ hotel });
  } catch (error) {
    console.log("Create hotel error:", error);
    return c.json({ error: "Failed to create hotel" }, 500);
  }
});

app.put("/make-server-47574933/hotels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const hotel = await kv.get(`hotel:${id}`);
    if (!hotel) return c.json({ error: "Hotel not found" }, 404);
    const updatedHotel = { ...hotel, ...updates };
    await kv.set(`hotel:${id}`, updatedHotel);
    return c.json({ hotel: updatedHotel });
  } catch (error) {
    console.log("Update hotel error:", error);
    return c.json({ error: "Failed to update hotel" }, 500);
  }
});

app.delete("/make-server-47574933/hotels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`hotel:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete hotel error:", error);
    return c.json({ error: "Failed to delete hotel" }, 500);
  }
});

// ==================== MENU ITEMS ROUTES ====================

app.get("/make-server-47574933/menu-items", async (c) => {
  try {
    const items = await kv.getByPrefix("menu_item:");
    return c.json({ items });
  } catch (error) {
    console.log("Get menu items error:", error);
    return c.json({ error: "Failed to get menu items" }, 500);
  }
});

app.post("/make-server-47574933/menu-items", async (c) => {
  try {
    const item = await c.req.json();
    await kv.set(`menu_item:${item.id}`, item);
    return c.json({ item });
  } catch (error) {
    console.log("Create menu item error:", error);
    return c.json({ error: "Failed to create menu item" }, 500);
  }
});

app.put("/make-server-47574933/menu-items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const item = await kv.get(`menu_item:${id}`);
    if (!item) return c.json({ error: "Menu item not found" }, 404);
    const updatedItem = { ...item, ...updates };
    await kv.set(`menu_item:${id}`, updatedItem);
    return c.json({ item: updatedItem });
  } catch (error) {
    console.log("Update menu item error:", error);
    return c.json({ error: "Failed to update menu item" }, 500);
  }
});

app.delete("/make-server-47574933/menu-items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`menu_item:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete menu item error:", error);
    return c.json({ error: "Failed to delete menu item" }, 500);
  }
});

// ==================== ORDERS ROUTES ====================

app.get("/make-server-47574933/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    return c.json({ orders });
  } catch (error) {
    console.log("Get orders error:", error);
    return c.json({ error: "Failed to get orders" }, 500);
  }
});

// Get ALL orders (both regular and buffet) - consolidated endpoint for performance
app.get("/make-server-47574933/all-orders", async (c) => {
  try {
    const [regularOrders, buffetOrders] = await Promise.all([
      kv.getByPrefix("order:"),
      kv.getByPrefix("buffet_order:")
    ]);
    const allOrders = [...(regularOrders || []), ...(buffetOrders || [])];
    return c.json({ orders: allOrders });
  } catch (error) {
    console.log("Get all orders error:", error);
    return c.json({ error: "Failed to get orders" }, 500);
  }
});

// Create order — fires email + in-app notification to hotel owner
app.post("/make-server-47574933/orders", async (c) => {
  try {
    const order = await c.req.json();
    await kv.set(`order:${order.id}`, order);

    // Look up hotel to get owner email
    const hotel = await kv.get(`hotel:${order.hotelId}`);
    console.log(`[ORDER] Hotel lookup for ID ${order.hotelId}:`, hotel?.name || 'NOT FOUND');
    const hotelEmail = hotel?.contact?.email;
    const hotelPhone = hotel?.contact?.phone || "";
    console.log(`[ORDER] Hotel email: ${hotelEmail || 'NOT SET'}`);
    const itemsList = (order.items || [])
      .map((i: any) => `<li>${i.name} x${i.quantity} — ${i.price.toLocaleString()} RWF</li>`)
      .join("");

    if (hotelEmail) {
      // Email to hotel owner
      const html = emailOrderTemplate(
        "🛎️ New Order Received!",
        `
        <p>You have a new order from <strong>${order.customerName}</strong>.</p>
        <ul style="padding-left:20px;line-height:1.8;">${itemsList}</ul>
        <p style="font-size:18px;font-weight:bold;color:#16a34a;">Total: ${order.total?.toLocaleString()} RWF</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        ${order.customerEmail ? `<p><strong>Customer Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>` : ""}
        <p style="margin-top:16px;color:#6b7280;font-size:13px;">Log in to your HaFi Serve Rwanda owner portal to manage this order.</p>
        `
      );
      console.log(`[ORDER] Sending email to ${hotelEmail}...`);
      await sendEmail(hotelEmail, `New Order from ${order.customerName} — HaFi Serve`, html);
      console.log(`[ORDER] Email sent to ${hotelEmail}`);

      // In-app notification for hotel owner
      await createNotification(
        hotelEmail,
        "🛎️ New Order!",
        `${order.customerName} ordered ${order.items?.length || 1} item(s) — ${order.total?.toLocaleString()} RWF`,
        "order",
        "/owner/orders"
      );
    }

    // In-app notification for customer
    if (order.customerEmail) {
      await createNotification(
        order.customerEmail,
        "✅ Order Placed!",
        `Your order at ${order.hotelName} has been received. Total: ${order.total?.toLocaleString()} RWF`,
        "order",
        "/customer/orders"
      );
    }

    return c.json({ order });
  } catch (error) {
    console.log("Create order error:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Update order status — fires email + notification to customer
app.put("/make-server-47574933/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const order = await kv.get(`order:${id}`);
    if (!order) return c.json({ error: "Order not found" }, 404);

    const updatedOrder = { ...order, ...updates };
    await kv.set(`order:${id}`, updatedOrder);

    // Send notification when status changes
    const newStatus = updates.status;
    if (newStatus && newStatus !== order.status) {
      const statusMessages: Record<string, { title: string; msg: string; emoji: string }> = {
        preparing: { title: "👨‍🍳 Order Being Prepared", msg: "Great news! The kitchen has started preparing your order.", emoji: "👨‍🍳" },
        ready: { title: "✅ Order Ready!", msg: "Your order is ready! Head to the hotel to pick it up.", emoji: "🎉" },
        delivered: { title: "🍽️ Order Delivered", msg: "Your order has been delivered. Enjoy your meal!", emoji: "🍽️" },
        cancelled: { title: "❌ Order Cancelled", msg: "Unfortunately your order has been cancelled. Contact the hotel for more info.", emoji: "❌" },
      };

      const info = statusMessages[newStatus];
      if (info && updatedOrder.customerEmail) {
        const hotel = await kv.get(`hotel:${updatedOrder.hotelId}`);
        const hotelPhone = hotel?.contact?.phone || "";
        const waLink = hotelPhone ? `<a href="${formatWhatsApp(hotelPhone)}" style="color:#16a34a;">WhatsApp: ${hotelPhone}</a>` : "";

        const html = emailOrderTemplate(
          info.title,
          `
          <p>Hi <strong>${updatedOrder.customerName}</strong>,</p>
          <p>${info.msg}</p>
          <p><strong>Hotel:</strong> ${updatedOrder.hotelName}</p>
          <p><strong>Order Total:</strong> ${updatedOrder.total?.toLocaleString()} RWF</p>
          ${hotelPhone ? `<p><strong>Contact Hotel:</strong> ${waLink} | <a href="tel:${hotelPhone}">${hotelPhone}</a></p>` : ""}
          `
        );
        await sendEmail(updatedOrder.customerEmail, `${info.emoji} Order Update — ${updatedOrder.hotelName}`, html);

        await createNotification(
          updatedOrder.customerEmail,
          info.title,
          `${info.msg} — ${updatedOrder.hotelName}`,
          "order",
          "/customer/orders"
        );
      }
    }

    return c.json({ order: updatedOrder });
  } catch (error) {
    console.log("Update order error:", error);
    return c.json({ error: "Failed to update order" }, 500);
  }
});

// ==================== ROOMS ROUTES ====================

app.get("/make-server-47574933/rooms/:hotelId", async (c) => {
  try {
    const hotelId = c.req.param("hotelId");
    const allRooms = await kv.getByPrefix(`room:${hotelId}:`);
    return c.json({ rooms: allRooms });
  } catch (error) {
    console.log("Get rooms error:", error);
    return c.json({ error: "Failed to get rooms" }, 500);
  }
});

app.post("/make-server-47574933/rooms", async (c) => {
  try {
    const room = await c.req.json();
    await kv.set(`room:${room.hotelId}:${room.id}`, room);
    return c.json({ room });
  } catch (error) {
    console.log("Create room error:", error);
    return c.json({ error: "Failed to create room" }, 500);
  }
});

app.put("/make-server-47574933/rooms/:hotelId/:id", async (c) => {
  try {
    const hotelId = c.req.param("hotelId");
    const id = c.req.param("id");
    const updates = await c.req.json();
    const room = await kv.get(`room:${hotelId}:${id}`);
    if (!room) return c.json({ error: "Room not found" }, 404);
    const updatedRoom = { ...room, ...updates };
    await kv.set(`room:${hotelId}:${id}`, updatedRoom);
    return c.json({ room: updatedRoom });
  } catch (error) {
    console.log("Update room error:", error);
    return c.json({ error: "Failed to update room" }, 500);
  }
});

app.delete("/make-server-47574933/rooms/:hotelId/:id", async (c) => {
  try {
    const hotelId = c.req.param("hotelId");
    const id = c.req.param("id");
    await kv.del(`room:${hotelId}:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Delete room error:", error);
    return c.json({ error: "Failed to delete room" }, 500);
  }
});

// ==================== ROOM BOOKINGS ROUTES ====================

app.get("/make-server-47574933/room-bookings", async (c) => {
  try {
    const bookings = await kv.getByPrefix("room_booking:");
    return c.json({ bookings });
  } catch (error) {
    console.log("Get room bookings error:", error);
    return c.json({ error: "Failed to get room bookings" }, 500);
  }
});

// Create room booking — fires email + notification to hotel owner
app.post("/make-server-47574933/room-bookings", async (c) => {
  try {
    const booking = await c.req.json();
    await kv.set(`room_booking:${booking.id}`, booking);

    const hotel = await kv.get(`hotel:${booking.hotelId}`);
    const hotelEmail = hotel?.contact?.email;
    const hotelPhone = hotel?.contact?.phone || "";

    const checkIn = new Date(booking.checkIn).toLocaleDateString("en-RW", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    const checkOut = new Date(booking.checkOut).toLocaleDateString("en-RW", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

    if (hotelEmail) {
      const html = emailOrderTemplate(
        "🏨 New Room Booking!",
        `
        <p>A room has been booked at your hotel.</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          <tr><td style="padding:6px 0;color:#6b7280;">Guest</td><td style="font-weight:bold;">${booking.customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Room</td><td style="font-weight:bold;">${booking.roomName} (${booking.roomType})</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Check-in</td><td style="font-weight:bold;">${checkIn}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Check-out</td><td style="font-weight:bold;">${checkOut}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Guests</td><td style="font-weight:bold;">${booking.guests}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Total</td><td style="font-weight:bold;color:#16a34a;">${booking.totalPrice?.toLocaleString()} RWF</td></tr>
          ${booking.customerEmail ? `<tr><td style="padding:6px 0;color:#6b7280;">Guest Email</td><td><a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></td></tr>` : ""}
        </table>
        <p style="color:#6b7280;font-size:13px;">Log in to your owner portal to confirm or manage this booking.</p>
        `
      );
      await sendEmail(hotelEmail, `New Room Booking from ${booking.customerName} — HaFi Serve`, html);
      await createNotification(
        hotelEmail,
        "🏨 New Room Booking!",
        `${booking.customerName} booked ${booking.roomName} — ${checkIn} to ${checkOut}`,
        "booking",
        "/owner/room-bookings"
      );
    }

    // Confirmation to customer
    if (booking.customerEmail) {
      const waLink = hotelPhone ? `<a href="${formatWhatsApp(hotelPhone)}" style="color:#16a34a;">WhatsApp the hotel</a>` : "";
      const html = emailOrderTemplate(
        "🏨 Room Booking Confirmed!",
        `
        <p>Hi <strong>${booking.customerName}</strong>, your room booking has been placed!</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          <tr><td style="padding:6px 0;color:#6b7280;">Hotel</td><td style="font-weight:bold;">${booking.hotelName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Room</td><td style="font-weight:bold;">${booking.roomName} (${booking.roomType})</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Check-in</td><td style="font-weight:bold;">${checkIn}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Check-out</td><td style="font-weight:bold;">${checkOut}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Total</td><td style="font-weight:bold;color:#16a34a;">${booking.totalPrice?.toLocaleString()} RWF</td></tr>
        </table>
        ${hotelPhone ? `<p>Contact the hotel to arrange payment: ${waLink} | <a href="tel:${hotelPhone}">${hotelPhone}</a></p>` : ""}
        `
      );
      await sendEmail(booking.customerEmail, `Room Booking at ${booking.hotelName} — HaFi Serve`, html);
      await createNotification(
        booking.customerEmail,
        "🏨 Booking Received!",
        `Your room booking at ${booking.hotelName} is pending confirmation. Check-in: ${checkIn}`,
        "booking",
        "/customer/my-bookings"
      );
    }

    return c.json({ booking });
  } catch (error) {
    console.log("Create room booking error:", error);
    return c.json({ error: "Failed to create room booking" }, 500);
  }
});

// Update room booking status — fires email + notification to customer
app.put("/make-server-47574933/room-bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const booking = await kv.get(`room_booking:${id}`);
    if (!booking) return c.json({ error: "Room booking not found" }, 404);

    const updatedBooking = { ...booking, ...updates };
    await kv.set(`room_booking:${id}`, updatedBooking);

    const newStatus = updates.status;
    if (newStatus && newStatus !== booking.status && updatedBooking.customerEmail) {
      const hotel = await kv.get(`hotel:${updatedBooking.hotelId}`);
      const hotelPhone = hotel?.contact?.phone || "";
      const waLink = hotelPhone ? `<a href="${formatWhatsApp(hotelPhone)}" style="color:#16a34a;">WhatsApp: ${hotelPhone}</a>` : "";

      const statusMessages: Record<string, { title: string; msg: string }> = {
        confirmed: { title: "✅ Booking Confirmed!", msg: "Your room booking has been confirmed by the hotel." },
        cancelled: { title: "❌ Booking Cancelled", msg: "Your room booking has been cancelled. Please contact the hotel for more information." },
      };

      const info = statusMessages[newStatus];
      if (info) {
        const checkIn = new Date(updatedBooking.checkIn).toLocaleDateString("en-RW", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
        const html = emailOrderTemplate(
          info.title,
          `
          <p>Hi <strong>${updatedBooking.customerName}</strong>,</p>
          <p>${info.msg}</p>
          <p><strong>Hotel:</strong> ${updatedBooking.hotelName}</p>
          <p><strong>Room:</strong> ${updatedBooking.roomName}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          ${hotelPhone ? `<p><strong>Contact Hotel:</strong> ${waLink}</p>` : ""}
          `
        );
        await sendEmail(updatedBooking.customerEmail, `${info.title} — ${updatedBooking.hotelName}`, html);
        await createNotification(
          updatedBooking.customerEmail,
          info.title,
          `${info.msg} — ${updatedBooking.hotelName}, Check-in: ${checkIn}`,
          "booking",
          "/customer/my-bookings"
        );
      }
    }

    return c.json({ booking: updatedBooking });
  } catch (error) {
    console.log("Update room booking error:", error);
    return c.json({ error: "Failed to update room booking" }, 500);
  }
});

// ==================== NOTIFICATIONS ROUTES ====================

// Create a notification (called from frontend)
app.post("/make-server-47574933/notifications", async (c) => {
  try {
    const { targetEmail, title, message, type, linkPath } = await c.req.json();
    if (!targetEmail || !title || !message || !type) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const notif = await createNotification(targetEmail, title, message, type, linkPath);
    return c.json({ notification: notif });
  } catch (error) {
    console.log("Create notification error:", error);
    return c.json({ error: "Failed to create notification" }, 500);
  }
});

// Get notifications for a user (by their email)
app.get("/make-server-47574933/notifications/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const notifs = await kv.getByPrefix(`notif:${email}:`);
    const sorted = [...notifs].sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ notifications: sorted });
  } catch (error) {
    console.log("Get notifications error:", error);
    return c.json({ error: "Failed to get notifications" }, 500);
  }
});

// Mark single notification as read
app.put("/make-server-47574933/notifications/read/:notifId", async (c) => {
  try {
    const notifId = c.req.param("notifId");
    const { email } = await c.req.json();
    const notif = await kv.get(`notif:${email}:${notifId}`);
    if (notif) {
      await kv.set(`notif:${email}:${notifId}`, { ...notif, read: true });
    }
    return c.json({ success: true });
  } catch (error) {
    console.log("Mark read error:", error);
    return c.json({ error: "Failed to mark notification as read" }, 500);
  }
});

// Mark all notifications as read for a user
app.put("/make-server-47574933/notifications/read-all/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const notifs = await kv.getByPrefix(`notif:${email}:`);
    for (const notif of notifs) {
      if (!notif.read) {
        await kv.set(`notif:${email}:${notif.id}`, { ...notif, read: true });
      }
    }
    return c.json({ success: true });
  } catch (error) {
    console.log("Mark all read error:", error);
    return c.json({ error: "Failed to mark notifications as read" }, 500);
  }
});

// ==================== BUFFETS ====================

app.get("/make-server-47574933/buffets", async (c) => {
  const buffets = await kv.getByPrefix("buffet:");
  return c.json({ buffets });
});

app.get("/make-server-47574933/buffets/:id", async (c) => {
  const id = c.req.param("id");
  const buffet = await kv.get(`buffet:${id}`);
  return c.json({ buffet });
});

app.get("/make-server-47574933/buffets/hotel/:hotelId", async (c) => {
  const hotelId = c.req.param("hotelId");
  const allBuffets = await kv.getByPrefix("buffet:");
  const hotelBuffets = allBuffets.filter((b: any) => b.hotelId === hotelId);
  return c.json({ buffets: hotelBuffets });
});

app.post("/make-server-47574933/buffets", async (c) => {
  const buffet = await c.req.json();
  await kv.set(`buffet:${buffet.id}`, buffet);
  return c.json({ buffet });
});

app.put("/make-server-47574933/buffets/:id", async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();
  await kv.set(`buffet:${id}`, updates);
  return c.json({ buffet: updates });
});

app.delete("/make-server-47574933/buffets/:id", async (c) => {
  const id = c.req.param("id");
  await kv.del(`buffet:${id}`);
  return c.json({ success: true });
});

// ==================== BUFFET ORDERS ====================

app.get("/make-server-47574933/buffet-orders", async (c) => {
  const orders = await kv.getByPrefix("buffet_order:");
  return c.json({ orders });
});

app.get("/make-server-47574933/buffet-orders/:id", async (c) => {
  const id = c.req.param("id");
  const order = await kv.get(`buffet_order:${id}`);
  return c.json({ order });
});

// Create buffet order — fires notification to hotel owner
app.post("/make-server-47574933/buffet-orders", async (c) => {
  try {
    const order = await c.req.json();
    await kv.set(`buffet_order:${order.id}`, order);

    const hotel = await kv.get(`hotel:${order.hotelId}`);
    const hotelEmail = hotel?.contact?.email;

    if (hotelEmail) {
      await createNotification(
        hotelEmail,
        "🍽️ New Buffet Order!",
        `${order.customerName} placed a buffet order — ${order.total?.toLocaleString()} RWF`,
        "order",
        "/owner/orders"
      );
      const html = emailOrderTemplate(
        "🍽️ New Buffet Order!",
        `<p><strong>${order.customerName}</strong> has placed a buffet order totalling <strong>${order.total?.toLocaleString()} RWF</strong>.</p>
        ${order.customerEmail ? `<p>Customer: <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>` : ""}
        <p style="color:#6b7280;font-size:13px;">Log in to your owner portal to manage this order.</p>`
      );
      await sendEmail(hotelEmail, `New Buffet Order — HaFi Serve`, html);
    }

    if (order.customerEmail) {
      await createNotification(
        order.customerEmail,
        "✅ Buffet Order Placed!",
        `Your buffet order at ${order.hotelName} is confirmed. Total: ${order.total?.toLocaleString()} RWF`,
        "order",
        "/customer/orders"
      );
    }

    return c.json({ order });
  } catch (error) {
    console.log("Create buffet order error:", error);
    return c.json({ order: await c.req.json().catch(() => ({})) });
  }
});

app.put("/make-server-47574933/buffet-orders/:id", async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();
  await kv.set(`buffet_order:${id}`, updates);
  return c.json({ order: updates });
});

// ==================== MESSAGES ====================

// Get all messages for a conversation (between customer and hotel)
app.get("/make-server-47574933/messages/:conversationId", async (c) => {
  try {
    const conversationId = c.req.param("conversationId");
    const messages = await kv.getByPrefix(`message:${conversationId}:`);
    const sorted = [...messages].sort((a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return c.json({ messages: sorted });
  } catch (error) {
    console.log("Get messages error:", error);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

// Get all conversations for a user (customer or hotel owner)
app.get("/make-server-47574933/conversations/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const conversations = await kv.getByPrefix(`conversation:${email}:`);
    const sorted = [...conversations].sort((a: any, b: any) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
    return c.json({ conversations: sorted });
  } catch (error) {
    console.log("Get conversations error:", error);
    return c.json({ error: "Failed to get conversations" }, 500);
  }
});

// Create or update a message
app.post("/make-server-47574933/messages", async (c) => {
  try {
    const message = await c.req.json();
    // message structure: { id, conversationId, senderEmail, senderName, text, createdAt }
    await kv.set(`message:${message.conversationId}:${message.id}`, message);

    // Update conversation metadata for both parties
    const conv = await kv.get(`conversation:${message.receiverEmail}:${message.conversationId}`) || {};
    const updatedConv = {
      ...conv,
      id: message.conversationId,
      customerEmail: message.customerEmail,
      customerName: message.customerName,
      hotelId: message.hotelId,
      hotelName: message.hotelName,
      hotelEmail: message.hotelEmail,
      lastMessage: message.text,
      lastMessageAt: message.createdAt,
      unreadCount: message.senderEmail === message.receiverEmail ? conv.unreadCount || 0 : (conv.unreadCount || 0) + 1,
    };

    // Save conversation for receiver
    await kv.set(`conversation:${message.receiverEmail}:${message.conversationId}`, updatedConv);

    // Save conversation for sender (with 0 unread)
    await kv.set(`conversation:${message.senderEmail}:${message.conversationId}`, {
      ...updatedConv,
      unreadCount: 0,
    });

    const isFromCustomer = message.senderEmail === message.customerEmail;
    const receiverLink = isFromCustomer ? "/owner/messages" : "/customer/messages";
    const preview = message.text.length > 60 ? message.text.substring(0, 60) + "..." : message.text;

    // In-app notification for receiver
    await createNotification(
      message.receiverEmail,
      `💬 New message from ${message.senderName}`,
      preview,
      "message",
      receiverLink
    );

    // Real email to receiver
    const emailHtml = emailOrderTemplate(
      `💬 New message from ${message.senderName}`,
      `
      <p>You have a new message on <strong>HaFi Serve Rwanda</strong>.</p>
      <div style="background:#f3f4f6;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
        <p style="margin:0;font-size:15px;color:#111827;">${message.text}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;">
        From: <strong>${message.senderName}</strong><br/>
        Hotel: <strong>${message.hotelName}</strong>
      </p>
      <p style="margin-top:16px;color:#6b7280;font-size:13px;">
        Log in to HaFi Serve Rwanda to reply.
      </p>
      `
    );
    await sendEmail(
      message.receiverEmail,
      `💬 ${message.senderName} sent you a message — HaFi Serve Rwanda`,
      emailHtml
    );

    return c.json({ message });
  } catch (error) {
    console.log("Create message error:", error);
    return c.json({ error: "Failed to create message" }, 500);
  }
});

// Mark conversation as read (resets unread count)
app.put("/make-server-47574933/conversations/:email/:conversationId/read", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const conversationId = c.req.param("conversationId");
    const conv = await kv.get(`conversation:${email}:${conversationId}`);
    if (conv) {
      await kv.set(`conversation:${email}:${conversationId}`, {
        ...conv,
        unreadCount: 0,
      });
    }
    return c.json({ success: true });
  } catch (error) {
    console.log("Mark conversation read error:", error);
    return c.json({ error: "Failed to mark conversation as read" }, 500);
  }
});

// ==================== INITIALIZATION ====================

app.post("/make-server-47574933/init", async (c) => {
  try {
    const { users, hotels, menuItems, orders, roomBookings, buffets, buffetOrders } = await c.req.json();

    if (users) for (const user of users) await kv.set(`user:${user.email}`, user);
    if (hotels) for (const hotel of hotels) await kv.set(`hotel:${hotel.id}`, hotel);
    if (menuItems) for (const item of menuItems) await kv.set(`menu_item:${item.id}`, item);
    if (orders) for (const order of orders) await kv.set(`order:${order.id}`, order);
    if (roomBookings) for (const booking of roomBookings) await kv.set(`room_booking:${booking.id}`, booking);
    if (buffets) for (const buffet of buffets) await kv.set(`buffet:${buffet.id}`, buffet);
    if (buffetOrders) for (const order of buffetOrders) await kv.set(`buffet_order:${order.id}`, order);

    return c.json({ success: true, message: "Data initialized successfully" });
  } catch (error) {
    console.log("Init error:", error);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

Deno.serve(app.fetch);
