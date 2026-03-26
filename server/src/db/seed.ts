import { db } from './instance';
import { menu, locations, admins, users } from '../config/schema';
import bcrypt from 'bcryptjs';
import pc from 'picocolors';

async function seed() {
  const line = pc.gray("─".repeat(60));
  console.log(line);
  console.log(pc.green(pc.bold("🌱 LAIKIPIA CANTEEN DATABASE SEEDER (V2 - ENHANCED)")));
  console.log(pc.white("Synchronizing Menu, Users, and System Locations..."));
  console.log(line);

  try {
    const saltRounds = 12;
    const commonPass = await bcrypt.hash("student123", saltRounds);
    const adminPass = await bcrypt.hash("admin123", saltRounds);

    // 🔐 ADMINS (System Controllers)
    console.log(pc.cyan("🔐 Seeding Administrative Core..."));
    await db.insert(admins).values([
      { name: "Boaz Kipchirchir", username: "boaz_dev", password: adminPass },
      { name: "Alice Wanjiku", username: "admin_alice", password: adminPass },
      { name: "James Otieno", username: "manager_james", password: adminPass }
    ]).onConflictDoNothing();

    // 🎓 USERS (Student Body)
    console.log(pc.cyan("🎓 Seeding Student Registry..."));
    await db.insert(users).values([
      {
        name: "Kevin Koech",
        email: "kevin@student.lu.ac.ke",
        phone: "254700112233",
        registerNumber: "S11/00551/24",
        department: "Computer Science",
        username: "kevo_cs",
        graduationYear: 2028,
        password: commonPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin"
      },
      {
        name: "Brian Mwangi",
        email: "brian@student.lu.ac.ke",
        phone: "254798765432",
        registerNumber: "S13/00045/23",
        department: "Information Technology",
        username: "brian_it",
        graduationYear: 2027,
        password: commonPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian"
      },
      {
        name: "Faith Njeri",
        email: "faith@student.lu.ac.ke",
        phone: "254711223344",
        registerNumber: "S13/00078/22",
        department: "Business Administration",
        username: "faith_biz",
        graduationYear: 2026,
        password: commonPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Faith"
      },
      {
        name: "Stacy Chebet",
        email: "stacy@student.lu.ac.ke",
        phone: "254722334455",
        registerNumber: "S15/00992/23",
        department: "Nursing",
        username: "stacy_che",
        graduationYear: 2027,
        password: commonPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stacy"
      }
    ]).onConflictDoNothing();

    // 📍 LOCATIONS (Pickup Windows)
    console.log(pc.cyan("📍 Seeding Delivery Points..."));
    await db.insert(locations).values([
      { name: "Main Canteen - Window A" },
      { name: "Main Canteen - Window B" },
      { name: "Science Complex Juice Bar" },
      { name: "Hostel Block C Pickup" },
      { name: "LKC Staff Lounge" }
    ]).onConflictDoNothing();

    // 🍱 MENU (With Price Update Logic)
    console.log(pc.cyan("🍱 Syncing Menu & Pricing..."));
    const menuItems = [
      { foodName: "Ugali + Sukuma + Beef", price: 180, category: "Combo" },
      { foodName: "Rice + Beans + Cabbage", price: 120, category: "Combo" },
      { foodName: "Chapati (2) + Ndengu", price: 90, category: "Combo" },
      { foodName: "Chips + Sausage (2)", price: 180, category: "Combo" },
      { foodName: "Pilau + Kachumbari + Soda", price: 220, category: "Combo" },
      { foodName: "Mukimo + Beef Stew", price: 170, category: "Combo" },
      { foodName: "Githeri + Avocado", price: 85, category: "Combo" },
      { foodName: "Tea (Large)", price: 25, category: "Breakfast" },
      { foodName: "Mandazi (Pair)", price: 30, category: "Breakfast" },
      { foodName: "Boiled Eggs", price: 25, category: "Breakfast" },
      { foodName: "Beef Stew (Side)", price: 120, category: "Lunch" },
      { foodName: "Chicken Wet Fry", price: 250, category: "Lunch" },
      { foodName: "Chips (Large)", price: 120, category: "Snacks" },
      { foodName: "Soda 500ml", price: 80, category: "Drinks" },
      { foodName: "Fresh Juice (Science Bar)", price: 100, category: "Drinks" }
    ];

    for (const item of menuItems) {
      await db.insert(menu).values({
        ...item,
        isAvailable: true,
      }).onConflictDoUpdate({
        target: menu.id, // Only works if you have IDs mapped, otherwise use foodName if it's unique
        set: { price: item.price, category: item.category }
      });
    }

    console.log(line);
    console.log(pc.green(pc.bold("✅ SEEDING PROTOCOL COMPLETE")));
    console.log(pc.white(`System Ready. Developer: ${pc.yellow("boaz_dev")}`));
    console.log(line);

  } catch (error) {
    console.error(pc.red("❌ Critical Seeding Error:"), error);
  } finally {
    process.exit(0);
  }
}

seed();