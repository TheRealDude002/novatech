import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  { name: 'Phone Cases', description: 'Drop-proof cases that look as good as the phone they protect.', icon: 'phone-case', order: 1 },
  { name: 'Screen Protectors', description: 'Tempered glass and film shields that keep your display pristine.', icon: 'shield', order: 2 },
  { name: 'Chargers', description: 'Wall and car chargers that deliver fast, safe power to every device.', icon: 'plug', order: 3 },
  { name: 'Wireless Chargers', description: 'Cable-free charging pads and stands for Qi-enabled devices.', icon: 'wireless', order: 4 },
  { name: 'USB Cables', description: 'USB-C to USB-C and USB-A cables built to bend without breaking.', icon: 'cable', order: 5 },
  { name: 'Lightning Cables', description: 'MFi-certified Lightning cables for iPhone, iPad and AirPods.', icon: 'lightning', order: 6 },
  { name: 'Power Banks', description: 'Portable battery packs that keep your day going past sunset.', icon: 'battery', order: 7 },
  { name: 'Bluetooth Earbuds', description: 'True wireless earbuds tuned for calls, music and podcasts.', icon: 'earbuds', order: 8 },
  { name: 'Bluetooth Speakers', description: 'Room-filling and outdoor-ready speakers with deep bass.', icon: 'speaker', order: 9 },
  { name: 'Smartwatches', description: 'Fitness and lifestyle smartwatches that pair with Android and iOS.', icon: 'watch', order: 10 },
  { name: 'Phone Holders', description: 'Desk, car and wall mounts that hold your phone where you need it.', icon: 'holder', order: 11 },
  { name: 'Memory Cards', description: 'High-speed microSD cards for cameras, phones and consoles.', icon: 'memory', order: 12 },
  { name: 'Ring Lights', description: 'Adjustable LED ring lights for content, calls and selfies.', icon: 'ring-light', order: 13 },
  { name: 'Selfie Sticks', description: 'Extendable sticks and tripods for the perfect frame.', icon: 'selfie', order: 14 },
  { name: 'Cleaning Kits', description: 'Safe cleaning sets for screens, lenses and keyboards.', icon: 'clean', order: 15 },
];

// Helper to make products
const P = (data) => data;

const PRODUCTS = [
  // ---------------- Phone Cases ----------------
  P({
    title: 'AeroShield Pro MagSafe Case for iPhone 15 Pro',
    description: 'A slim, military-grade case with a built-in magnetic ring that snaps perfectly to MagSafe chargers and mounts. The matte back resists fingerprints and the raised lip guards your screen from face-down drops. Tested to survive 12-foot drops onto concrete without cracking the screen or back glass.',
    shortDescription: 'MagSafe-ready slim case tested to 12-foot drops.',
    category: 'Phone Cases', brand: 'NovaGuard', sku: 'NG-IP15P-MS-BK',
    price: 18500, salePrice: 14200, stock: 84,
    colors: [{ name: 'Midnight Black', hex: '#0B0F1A' }, { name: 'Sand', hex: '#D9C8AE' }, { name: 'Electric Indigo', hex: '#4F46E5' }],
    images: ['https://www.istore.com.ng/cdn/shop/files/Appleclearmagsafe1_ac40fd1c-e255-463f-a3b3-3eab1746ccfd_1200x.jpg?v=1699200265', 'https://www.tech21.com/cdn/shop/files/6d634f3d-232a-4006-b967-d471fa952098.jpg'],
    specs: [['Material', 'TPU + Polycarbonate'], ['MagSafe', 'Yes — 18 magnets'], ['Drop rating', '12 ft / 3.6 m'], ['Wireless charging', 'Compatible']],
    warranty: '12 months', tags: ['magsafe', 'iphone', 'premium'], isFeatured: true, soldCount: 412,
  }),
  P({
    title: 'Lumina Clear Case for Samsung Galaxy S24 Ultra',
    description: 'Crystal-clear case that refuses to yellow. Anti-yellow coating keeps the case transparent for over a year, while the precision cutouts give full access to the S-Pen and ports. Slim profile keeps the phone s natural feel.',
    shortDescription: 'Anti-yellow clear case for Galaxy S24 Ultra.',
    category: 'Phone Cases', brand: 'NovaGuard', sku: 'NG-S24U-CL',
    price: 12000, salePrice: null, stock: 53,
    colors: [{ name: 'Crystal Clear', hex: '#E8F0F7' }],
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900'],
    specs: [['Material', 'Anti-yellow TPU'], ['S-Pen cutout', 'Yes'], ['Wireless charging', 'Compatible']],
    warranty: '6 months', tags: ['samsung', 'clear'], isFeatured: false, soldCount: 167,
  }),
  P({
    title: 'Rugged Armor Leather Wallet Case — iPhone 15',
    description: 'A full-grain leather wallet case with three card slots and a magnetic flap. The inner TPU shell absorbs shock while the leather patinas beautifully over time. Perfect for nights out when you want to leave the wallet at home.',
    shortDescription: 'Leather wallet case with 3 card slots.',
    category: 'Phone Cases', brand: 'Benson & Co.', sku: 'BC-IP15-WL-TN',
    price: 24000, salePrice: 19800, stock: 32,
    colors: [{ name: 'Tan', hex: '#B57A3A' }, { name: 'Espresso', hex: '#3D2418' }],
    images: ['https://www.decodedgear.com/cdn/shop/files/D24IPO15PDW5TN-18_2048x.jpg'],
    specs: [['Material', 'Full-grain leather'], ['Card slots', '3'], ['Closure', 'Magnetic flap']],
    warranty: '12 months', tags: ['leather', 'wallet'], isFeatured: true, soldCount: 98,
  }),
  P({
    title: 'SlimFlex Silicone Case for Google Pixel 8',
    description: 'Soft-touch silicone case with a microfiber lining that prevents scratches on the back of your phone. The button covers feel tactile and responsive. Available in five carefully chosen colors.',
    shortDescription: 'Soft-touch silicone with microfiber lining.',
    category: 'Phone Cases', brand: 'NovaGuard', sku: 'NG-PX8-SC',
    price: 9500, salePrice: null, stock: 67,
    colors: [{ name: 'Storm', hex: '#3F4A5A' }, { name: 'Coral', hex: '#FF6B6B' }, { name: 'Fern', hex: '#52B788' }],
    images: ['https://www.otofly.co/cdn/shop/files/pixel-8-silicone-case-mint-green.webp?v=1713338402&width=1000'],
    specs: [['Material', 'Liquid silicone'], ['Lining', 'Microfiber']],
    warranty: '6 months', tags: ['pixel'], isFeatured: false, soldCount: 73,
  }),

  // ---------------- Screen Protectors ----------------
  P({
    title: 'CrystalGuard 9H Tempered Glass — iPhone 15 Pro Max',
    description: 'Edge-to-edge tempered glass with a 9H hardness rating. Oleophobic coating keeps fingerprints at bay and the included alignment tray makes installation nearly foolproof. Two-pack so you have a backup ready.',
    shortDescription: '9H tempered glass with alignment tray — 2-pack.',
    category: 'Screen Protectors', brand: 'ClearVue', sku: 'CV-IP15PM-TG-2P',
    price: 8500, salePrice: 6500, stock: 145,
    images: ['https://www.myphonecase.com/cdn/shop/files/s-l1600_56_218c7842-a743-4006-aeda-7ab129157178.jpg'],
    specs: [['Hardness', '9H'], ['Thickness', '0.33 mm'], ['Coating', 'Oleophobic'], ['Pack', '2 protectors']],
    warranty: '12 months', tags: ['tempered-glass'], isFeatured: true, soldCount: 689,
  }),
  P({
    title: 'Privacy Glass Protector — Samsung Galaxy S24',
    description: 'Privacy filter that darkens the screen at off-angles, so your messages stay yours on a packed BRT bus. The glass maintains touch sensitivity and clarity straight-on.',
    shortDescription: 'Privacy filter that blocks side viewing angles.',
    category: 'Screen Protectors', brand: 'ClearVue', sku: 'CV-S24-PV',
    price: 11000, salePrice: null, stock: 78,
    images: ['https://i5.walmartimages.com/seo/Privacy-Tempered-Glass-Screen-Protector-for-Samsung-Galaxy-S24-Ultra_f943ce16-6d15-4124-a09d-74eaeaba92bc.09fb8539c4d58030ff6d97a8c4c57899.jpeg'],
    specs: [['Privacy angle', '30°'], ['Hardness', '9H']],
    warranty: '6 months', tags: ['privacy'], isFeatured: false, soldCount: 234,
  }),
  P({
    title: 'Anti-Glare Matte Film — iPad Air 11"',
    description: 'Matte PET film that cuts glare and feels close to paper — ideal for sketching with the Apple Pencil. Cuts reflections from overhead lights and reduces smudges.',
    shortDescription: 'Paper-like matte film for sketching.',
    category: 'Screen Protectors', brand: 'ClearVue', sku: 'CV-IPADAIR-MAT',
    price: 14500, salePrice: null, stock: 41,
    images: ['https://screenshield.us/cdn/shop/files/AGSingleAG4209490_600x.jpg?v=1715122569'],
    specs: [['Finish', 'Matte'], ['Surface', 'Paper-like'], ['Device', 'iPad Air 11"']],
    warranty: '6 months', tags: ['ipad', 'matte'], isFeatured: false, soldCount: 56,
  }),

  // ---------------- Chargers ----------------
  P({
    title: 'NovaCharge 65W GaN III Wall Charger',
    description: 'A pocketable 65W GaN charger that can power a laptop, tablet and phone at the same time. Two USB-C ports and one USB-A port share power intelligently. Foldable prongs make it travel-ready.',
    shortDescription: '65W 3-port GaN charger for laptops and phones.',
    category: 'Chargers', brand: 'VoltEdge', sku: 'VE-GAN65-3P',
    price: 32000, salePrice: 26500, stock: 89,
    colors: [{ name: 'White', hex: '#F4F4F0' }, { name: 'Black', hex: '#0B0F1A' }],
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900'],
    specs: [['Output', '65W total'], ['Ports', '2× USB-C, 1× USB-A'], ['Tech', 'GaN III'], ['Prongs', 'Foldable']],
    warranty: '18 months', tags: ['gan', 'fast-charge'], isFeatured: true, soldCount: 521,
  }),
  P({
    title: 'TurboVolt 20W USB-C Car Charger',
    description: 'Compact car charger that delivers 20W of USB-C PD power for fast charging on the road. Soft LED ring makes the port easy to find at night without lighting up the whole cabin.',
    shortDescription: '20W USB-C PD car charger with night ring.',
    category: 'Chargers', brand: 'VoltEdge', sku: 'VE-CAR20',
    price: 7500, salePrice: null, stock: 112,
    images: ['https://turbocables.co.uk/cdn/shop/files/1_d24d38d8-db6a-48a6-9868-73c182c6d284.png?v=1766575971'],
    specs: [['Output', '20W USB-C PD'], ['Input', '12-24V car socket']],
    warranty: '12 months', tags: ['car'], isFeatured: false, soldCount: 318,
  }),
  P({
    title: 'PowerHub 100W 4-Port Desktop Charger',
    description: 'A desktop charging station that replaces the tangle of bricks on your desk. Four ports (3× USB-C, 1× USB-A) deliver up to 100W total, with a 1.5m braided power cable.',
    shortDescription: 'Desktop 100W charging station, 4 ports.',
    category: 'Chargers', brand: 'VoltEdge', sku: 'VE-DSK100',
    price: 45000, salePrice: 38000, stock: 26,
    images: ['https://select.com.ng/media/catalog/product/cache/a38b917da5ab184066ddc7d1bf214715/u/g/ugreen_100w_gan_desktop_charger_with_4_ports.png'],
    specs: [['Output', '100W total'], ['Ports', '3× USB-C, 1× USB-A'], ['Cable', '1.5 m braided']],
    warranty: '18 months', tags: ['desktop', 'gan'], isFeatured: false, soldCount: 87,
  }),

  // ---------------- Wireless Chargers ----------------
  P({
    title: 'Aukey Magfusion Qi2 2-in-1 Foldable Charger',
    description: 'Qi2-certified wireless charging pad that snaps MagSafe-compatible phones into perfect alignment. Delivers 15W to iPhone 13 and newer, 15W to Qi2 Android phones, and 5W to earbuds. Anti-slip silicone base keeps it in place.',
    shortDescription: '15W Qi2 magnetic wireless charging pad.',
    category: 'Wireless Chargers', brand: 'VoltEdge', sku: 'VE-QI2-15W',
    price: 22000, salePrice: 17900, stock: 64,
    colors: [{ name: 'Cloud', hex: '#F4F4F0' }, { name: 'Ink', hex: '#0B0F1A' }],
    images: ['https://i.ebayimg.com/images/g/KqcAAeSw6SNp63Gg/s-l1600.webp', 'https://i.ebayimg.com/images/g/OroAAeSwAxtp63Gg/s-l1600.webp'],
    specs: [['Output', '15W max'], ['Standard', 'Qi2 / MagSafe'], ['Input', 'USB-C PD']],
    warranty: '12 months', tags: ['qi2', 'magsafe'], isFeatured: true, soldCount: 256,
  }),
  P({
    title: 'LumenStand 3-in-1 Wireless Charging Stand',
    description: 'Charge your phone, watch and earbuds from one stand. The phone pad tilts so you can keep an eye on notifications, and the watch puck holds the device in night-stand mode.',
    shortDescription: '3-in-1 stand for phone, watch and earbuds.',
    category: 'Wireless Chargers', brand: 'VoltEdge', sku: 'VE-3IN1-STAND',
    price: 38000, salePrice: null, stock: 33,
    images: ['https://deutschmacht.com/cdn/shop/files/3in1.png'],
    specs: [['Phone', '15W Qi2'], ['Watch', '5W Apple Watch'], ['Earbuds', '5W Qi']],
    warranty: '12 months', tags: ['3-in-1'], isFeatured: false, soldCount: 91,
  }),

  // ---------------- USB Cables ----------------
  P({
    title: 'FlexiBraid USB-C to USB-C Cable 2m',
    description: 'Braided 100W USB-C cable that refuses to tangle. Reinforced stress points have been tested to 30,000 bends. Two-meter length reaches from the wall outlet to the couch comfortably.',
    shortDescription: '100W braided USB-C cable, 2m.',
    category: 'USB Cables', brand: 'CableLabs', sku: 'CL-USBC-100W-2M',
    price: 6500, salePrice: 4900, stock: 234,
    colors: [{ name: 'Charcoal', hex: '#1A1F2E' }, { name: 'Sunset', hex: '#FF4D2E' }],
    images: ['https://freshnrebel.com/thumbnail/22/02/ab/1746785338/8720249811732_1_1920x1920.jpg'],
    specs: [['Length', '2 m'], ['Power', '100W PD'], ['Connector', 'USB-C to USB-C'], ['Bend test', '30,000 cycles']],
    warranty: '24 months', tags: ['usb-c', '100w'], isFeatured: true, soldCount: 1102,
  }),
  P({
    title: 'FlexiBraid USB-A to USB-C Cable 1m',
    description: 'Durable 1m USB-A to USB-C cable for older chargers and car ports. Same braided sheath and reinforced joints as our 100W cable.',
    shortDescription: 'Braided USB-A to USB-C cable, 1m.',
    category: 'USB Cables', brand: 'CableLabs', sku: 'CL-USBA-USBC-1M',
    price: 3500, salePrice: null, stock: 312,
    images: ['https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/HRHR2_AV1?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=TlMwZ0FxL0lCVkNrdjdpbXF4NG1mMVZya2lKWlJmUEwrYndWOTJiVWJWQUYwVmtIbGRkS25RMVpBRlo0bk5DUUpTVzFBOGZLMFUxaitiZUdrTCtXeEE'],
    specs: [['Length', '1 m'], ['Power', '18W'], ['Connector', 'USB-A to USB-C']],
    warranty: '24 months', tags: ['usb-c'], isFeatured: false, soldCount: 768,
  }),

  // ---------------- Lightning Cables ----------------
  P({
    title: 'MFi Lightning to USB-C Cable 1.5m',
    description: 'Apple MFi-certified Lightning cable that safely fast-charges iPhone 8 and newer at 20W. The braided sheath resists fraying and the connectors sit flush with most cases.',
    shortDescription: 'MFi Lightning cable, 1.5m, 20W.',
    category: 'Lightning Cables', brand: 'CableLabs', sku: 'CL-LT-20W-1.5M',
    price: 8500, salePrice: 6900, stock: 198,
    images: ['https://www.senheng.com.my/wp-content/uploads/2025/12/energea-nyloflex-usb-c-to-lightning-c94-mfi-15m-2025-front.jpg?w=1000'],
    specs: [['Length', '1.5 m'], ['Power', '20W PD'], ['Certification', 'Apple MFi']],
    warranty: '12 months', tags: ['lightning', 'mfi'], isFeatured: false, soldCount: 542,
  }),
  P({
    title: 'Tangle-Free Lightning Cable 0.5m',
    description: 'Short Lightning cable for power banks and car chargers. Flat cable design refuses to tangle in your bag.',
    shortDescription: 'Short flat Lightning cable, 0.5m.',
    category: 'Lightning Cables', brand: 'CableLabs', sku: 'CL-LT-FLAT-0.5M',
    price: 4500, salePrice: null, stock: 410,
    images: ['https://cdn11.bigcommerce.com/s-apgyqyq0gk/images/stencil/1280x1280/products/4029/8937/BL-MFIP2GY715_1__99944.1741325609.jpg'],
    specs: [['Length', '0.5 m'], ['Design', 'Flat tangle-free']],
    warranty: '12 months', tags: ['lightning'], isFeatured: false, soldCount: 389,
  }),

  // ---------------- Power Banks ----------------
  P({
    title: 'TitanCell 20,000mAh 30W Power Bank',
    description: 'Slim 20,000mAh power bank with a 30W USB-C PD port that can charge a MacBook Air or iPhone at full speed. Built-in display shows remaining percentage. Charges three devices at once.',
    shortDescription: '20,000mAh 30W PD power bank with display.',
    category: 'Power Banks', brand: 'VoltEdge', sku: 'VE-PB20K-30W',
    price: 42000, salePrice: 35500, stock: 47,
    colors: [{ name: 'Graphite', hex: '#1A1F2E' }, { name: 'Sand', hex: '#D9C8AE' }],
    images: ['https://m.media-amazon.com/images/I/51x2Z8r0RnL._AC_UF894,1000_QL80_.jpg'],
    specs: [['Capacity', '20,000 mAh'], ['Output', '30W USB-C PD'], ['Ports', '2× USB-C, 1× USB-A'], ['Display', 'Yes — %']],
    warranty: '18 months', tags: ['power-bank', '30w'], isFeatured: true, soldCount: 612,
  }),
  P({
    title: 'PocketCharge 10,000mAh Slim Power Bank',
    description: 'A shirt-pocket power bank with a built-in USB-C cable and Lightning connector — no extra cables needed. Charges most phones 1.5 times over.',
    shortDescription: '10,000mAh power bank with built-in cables.',
    category: 'Power Banks', brand: 'VoltEdge', sku: 'VE-PB10K-SLIM',
    price: 21000, salePrice: null, stock: 88,
    images: ['https://ambraneindia.com/cdn/shop/files/2_jpg_8ab20973-1971-40ab-b3bf-859026e5c38a.webp'],
    specs: [['Capacity', '10,000 mAh'], ['Built-in cables', 'USB-C, Lightning'], ['Output', '22.5W']],
    warranty: '12 months', tags: ['power-bank'], isFeatured: false, soldCount: 423,
  }),

  // ---------------- Bluetooth Earbuds ----------------
  P({
    title: 'AirPulse Pro ANC Wireless Earbuds',
    description: 'Active noise-cancelling earbuds with up to 32dB of noise reduction. Six microphones deliver clear calls even on a noisy Lagos street. Up to 8 hours of playback per charge, 32 hours total with the case.',
    shortDescription: 'ANC earbuds with 32-hour battery, 6 mics.',
    category: 'Bluetooth Earbuds', brand: 'AudioForge', sku: 'AF-PRO-ANC',
    price: 68000, salePrice: 54000, stock: 52,
    colors: [{ name: 'Pearl', hex: '#F4F4F0' }, { name: 'Onyx', hex: '#0B0F1A' }, { name: 'Indigo', hex: '#4F46E5' }],
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900'],
    specs: [['ANC', 'Yes — up to 32 dB'], ['Battery', '8h earbuds / 32h with case'], ['Bluetooth', '5.3'], ['Water resistance', 'IPX5'], ['Microphones', '6']],
    warranty: '12 months', tags: ['anc', 'premium'], isFeatured: true, soldCount: 327,
  }),
  P({
    title: 'BeatMini Compact Wireless Earbuds',
    description: 'Tiny, lightweight earbuds that disappear into your ears. 6-hour playback per charge, 24 hours total. Touch controls, IPX4 sweat resistance — great for runs and gym sessions.',
    shortDescription: 'Compact earbuds for everyday listening.',
    category: 'Bluetooth Earbuds', brand: 'AudioForge', sku: 'AF-MINI',
    price: 18500, salePrice: 14900, stock: 124,
    colors: [{ name: 'Cloud', hex: '#F4F4F0' }, { name: 'Black', hex: '#0B0F1A' }],
    images: ['https://images.unsplash.com/photo-1655560378428-7605bda51749'],
    specs: [['Battery', '6h earbuds / 24h with case'], ['Bluetooth', '5.3'], ['Water resistance', 'IPX4']],
    warranty: '12 months', tags: ['compact'], isFeatured: false, soldCount: 211,
  }),

  // ---------------- Bluetooth Speakers ----------------
  P({
    title: 'BoomBox 360 Outdoor Speaker',
    description: 'A 360-degree speaker that fills a room or a beach picnic with rich, balanced sound. IP67 waterproof rating means it survives a dunk in the pool. 24-hour battery and a built-in bottle opener — yes, really.',
    shortDescription: '360° IP67 outdoor speaker, 24h battery.',
    category: 'Bluetooth Speakers', brand: 'AudioForge', sku: 'AF-BOOM-360',
    price: 58000, salePrice: 47000, stock: 38,
    colors: [{ name: 'Forest', hex: '#2D5A3D' }, { name: 'Sunset', hex: '#FF4D2E' }, { name: 'Slate', hex: '#3F4A5A' }],
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900'],
    specs: [['Output', '30W RMS'], ['Battery', '24 hours'], ['Water resistance', 'IP67'], ['360° sound', 'Yes']],
    warranty: '12 months', tags: ['outdoor', 'waterproof'], isFeatured: true, soldCount: 184,
  }),
  P({
    title: 'MiniBeat Portable Speaker',
    description: 'Pocket-sized speaker with surprisingly loud output. 12-hour battery, IP67 waterproof, and a stretchy strap that loops around bike handlebars or shower heads.',
    shortDescription: 'Pocket speaker, 12h battery, IP67.',
    category: 'Bluetooth Speakers', brand: 'AudioForge', sku: 'AF-MINIBEAT',
    price: 17500, salePrice: null, stock: 96,
    images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?w=900'],
    specs: [['Output', '8W'], ['Battery', '12 hours'], ['Water resistance', 'IP67']],
    warranty: '12 months', tags: ['compact'], isFeatured: false, soldCount: 276,
  }),

  // ---------------- Smartwatches ----------------
  P({
    title: 'PulseWatch Active 2 GPS Smartwatch',
    description: 'A GPS smartwatch with built-in heart-rate, SpO2 and sleep tracking. 14-day battery life in standard mode, 7 days with always-on display. Compatible with iOS and Android. Receives calls and notifications via Bluetooth.',
    shortDescription: 'GPS smartwatch with 14-day battery.',
    category: 'Smartwatches', brand: 'PulseTech', sku: 'PT-ACTIVE2',
    price: 92000, salePrice: 78000, stock: 24,
    colors: [{ name: 'Midnight', hex: '#0B0F1A' }, { name: 'Rose Gold', hex: '#B76E79' }, { name: 'Silver', hex: '#C0C0C0' }],
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900'],
    specs: [['Display', '1.43" AMOLED'], ['Battery', '14 days standard'], ['GPS', 'Yes — dual-band'], ['Water resistance', '5 ATM'], ['Sensors', 'HR, SpO2, sleep']],
    warranty: '12 months', tags: ['gps', 'fitness'], isFeatured: true, soldCount: 142,
  }),
  P({
    title: 'PulseWatch Lite Fitness Band',
    description: 'A slim fitness band that tracks steps, heart rate, sleep and 30 workout modes. 10-day battery life, IP68 water resistance. The 1.1-inch AMOLED touch display stays readable in direct sunlight.',
    shortDescription: 'Slim fitness band with 10-day battery.',
    category: 'Smartwatches', brand: 'PulseTech', sku: 'PT-LITE',
    price: 28000, salePrice: 22500, stock: 67,
    colors: [{ name: 'Black', hex: '#0B0F1A' }, { name: 'Mauve', hex: '#9B5DE5' }],
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=900'],
    specs: [['Display', '1.1" AMOLED'], ['Battery', '10 days'], ['Water resistance', 'IP68'], ['Workout modes', '30']],
    warranty: '12 months', tags: ['fitness'], isFeatured: false, soldCount: 213,
  }),

  // ---------------- Phone Holders ----------------
  P({
    title: 'GripMount MagSafe Car Vent Holder',
    description: 'MagSafe-compatible car vent holder with a strong N52 magnet ring. One-handed mount and release. Adjustable ball joint lets you angle the phone for the perfect nav view.',
    shortDescription: 'MagSafe car vent holder, one-handed.',
    category: 'Phone Holders', brand: 'MountPro', sku: 'MP-MS-CAR',
    price: 9500, salePrice: null, stock: 158,
    images: ['https://m.media-amazon.com/images/I/71OGlqsHHuL.jpg'],
    specs: [['Mount', 'MagSafe magnetic'], ['Attachment', 'Car vent clip'], ['Magnet', 'N52']],
    warranty: '12 months', tags: ['car', 'magsafe'], isFeatured: false, soldCount: 432,
  }),
  P({
    title: 'SteadyStand Aluminum Desk Phone Stand',
    description: 'A solid aluminum desk stand with a weighted base and silicone pads that protect your phone and desk. Adjustable angle, folds flat for travel. Works with cases up to 10mm thick.',
    shortDescription: 'Aluminum desk stand, folds flat.',
    category: 'Phone Holders', brand: 'MountPro', sku: 'MP-DESK-AL',
    price: 12500, salePrice: 9900, stock: 73,
    images: ['https://irrnrwxhjnmk5p.ldycdn.com/cloud/ljBqjKlrSRlkjjrrmijn/K62-SL-800-800.jpg'],
    specs: [['Material', 'Aluminum alloy'], ['Adjustable', 'Yes'], ['Folds flat', 'Yes']],
    warranty: '12 months', tags: ['desk'], isFeatured: false, soldCount: 188,
  }),

  // ---------------- Memory Cards ----------------
  P({
    title: 'SpeedDrive microSDXC 256GB U3 V30',
    description: 'UHS-I U3 V30 microSD card with read speeds up to 200MB/s. Ideal for 4K video, burst photography and Nintendo Switch storage expansion. Includes SD adapter.',
    shortDescription: '256GB microSD, 200MB/s read, 4K-ready.',
    category: 'Memory Cards', brand: 'SpeedDrive', sku: 'SD-MSD-256-U3',
    price: 28000, salePrice: 22500, stock: 92,
    images: ['https://ng.jumia.is/unsafe/fit-in/1000x1000/filters:fill(white)/product/50/452867/1.jpg'],
    specs: [['Capacity', '256 GB'], ['Speed class', 'U3 / V30 / Class 10'], ['Read', '200 MB/s'], ['Write', '90 MB/s'], ['Adapter', 'SD included']],
    warranty: '60 months', tags: ['microsd', '4k'], isFeatured: true, soldCount: 367,
  }),
  P({
    title: 'SpeedDrive microSDXC 128GB A2',
    description: 'A2-rated microSD card with faster app performance for Android phones and tablets. Read speeds up to 170MB/s. Includes SD adapter.',
    shortDescription: '128GB microSD, A2 app-rated.',
    category: 'Memory Cards', brand: 'SpeedDrive', sku: 'SD-MSD-128-A2',
    price: 16500, salePrice: null, stock: 134,
    images: ['https://i.ebayimg.com/images/g/jy4AAeSwc3VpAkIB/s-l1600.webp'],
    specs: [['Capacity', '128 GB'], ['App class', 'A2'], ['Read', '170 MB/s']],
    warranty: '60 months', tags: ['microsd'], isFeatured: false, soldCount: 298,
  }),

  // ---------------- Ring Lights ----------------
  P({
    title: 'Lumino 18" LED Ring Light with Stand',
    description: 'A professional 18-inch ring light with 3 color temperatures and 10 brightness levels. Includes a sturdy 7-foot stand, phone holder and a remote shutter. Perfect for content creators and beauty professionals.',
    shortDescription: '18" ring light with stand and remote.',
    category: 'Ring Lights', brand: 'Lumino', sku: 'LM-RL-18',
    price: 48000, salePrice: 39000, stock: 29,
    images: ['https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/89/4389811/1.jpg?9316'],
    specs: [['Diameter', '18 inches'], ['Color temps', '3 (3200K/4500K/6500K)'], ['Brightness', '10 levels'], ['Stand', '7 ft']],
    warranty: '12 months', tags: ['creator'], isFeatured: true, soldCount: 134,
  }),
  P({
    title: 'Lumino Mini 10" Ring Light',
    description: 'Compact 10-inch ring light for desk use, video calls and selfies. USB-powered, with a flexible phone mount and a small desk tripod.',
    shortDescription: '10" USB-powered ring light for desk.',
    category: 'Ring Lights', brand: 'Lumino', sku: 'LM-RL-10',
    price: 16500, salePrice: null, stock: 86,
    images: ['https://nanahawabeauty.com/cdn/shop/products/10inchesringlight.jpg'],
    specs: [['Diameter', '10 inches'], ['Power', 'USB'], ['Brightness', '10 levels']],
    warranty: '12 months', tags: ['desk'], isFeatured: false, soldCount: 218,
  }),

  // ---------------- Selfie Sticks ----------------
  P({
    title: 'ExtendReach Pro Selfie Stick Tripod',
    description: 'A selfie stick that converts into a 50-inch tripod. Bluetooth remote shutter pairs with any phone. Folds to 19cm for travel. Phone holder rotates 270° for portrait or landscape.',
    shortDescription: 'Selfie stick to tripod, 50" extended.',
    category: 'Selfie Sticks', brand: 'MountPro', sku: 'MP-SS-PRO',
    price: 13500, salePrice: 9900, stock: 117,
    colors: [{ name: 'Black', hex: '#0B0F1A' }, { name: 'Rose', hex: '#B76E79' }],
    images: ['https://img-1.kwcdn.com/product/open/91aece349b8046c793c24991a95b53ec-goods.jpeg'],
    specs: [['Extended', '50 inches'], ['Folded', '19 cm'], ['Remote', 'Bluetooth'], ['Rotation', '270°']],
    warranty: '12 months', tags: ['tripod'], isFeatured: false, soldCount: 289,
  }),
  P({
    title: 'PocketStick Mini Selfie Stick',
    description: 'A pocket-sized selfie stick that extends to 65cm and folds down to 13cm. Wired shutter button works without charging.',
    shortDescription: 'Pocket selfie stick, wired shutter.',
    category: 'Selfie Sticks', brand: 'MountPro', sku: 'MP-SS-MINI',
    price: 5500, salePrice: null, stock: 203,
    images: ['https://img-2.kwcdn.com/product/fancy/fc9c64e7-c51d-4e68-b558-461ed369f351.jpg'],
    specs: [['Extended', '65 cm'], ['Folded', '13 cm'], ['Shutter', 'Wired 3.5mm']],
    warranty: '6 months', tags: ['compact'], isFeatured: false, soldCount: 412,
  }),

  // ---------------- Cleaning Kits ----------------
  P({
    title: 'SparkleClean Pro Electronics Care Kit',
    description: 'A complete cleaning kit for phones, laptops, earbuds and screens. Includes a 60ml alcohol-free spray, two microfiber cloths, a soft-bristle brush, cleaning swabs and a reusable travel pouch.',
    shortDescription: 'Complete cleaning kit for devices.',
    category: 'Cleaning Kits', brand: 'SparkleClean', sku: 'SC-PRO-KIT',
    price: 9500, salePrice: 7500, stock: 178,
    images: ['https://m.media-amazon.com/images/I/71Tst-ypIFL._AC_UF894,1000_QL80_.jpg'],
    specs: [['Spray', '60ml alcohol-free'], ['Cloths', '2× microfiber'], ['Brush', 'Soft bristle'], ['Swabs', '10× cleaning']],
    warranty: '—', tags: ['cleaning'], isFeatured: false, soldCount: 524,
  }),
  P({
    title: 'ScreenWipe Microfiber 5-Pack',
    description: 'Five large (30×30cm) microfiber cloths in five colors. Lint-free and machine washable. Perfect for screens, glasses and camera lenses.',
    shortDescription: '5-pack of large microfiber cloths.',
    category: 'Cleaning Kits', brand: 'SparkleClean', sku: 'SC-CLOTH-5P',
    price: 4500, salePrice: null, stock: 256,
    images: ['https://m.media-amazon.com/images/I/81CzsRS8qcL._AC_SX679_.jpg'],
    specs: [['Size', '30 × 30 cm'], ['Count', '5'], ['Washable', 'Yes']],
    warranty: '—', tags: ['cleaning'], isFeatured: false, soldCount: 638,
  }),
];

const TESTIMONIALS_SEED_USERS = [
  { name: 'Adaeze O.', email: 'adaeze.o@example.com', password: 'Password123', phone: '+234 803 111 2222' },
  { name: 'Tunde B.', email: 'tunde.b@example.com', password: 'Password123', phone: '+234 805 222 3333' },
  { name: 'Fatima I.', email: 'fatima.i@example.com', password: 'Password123', phone: '+234 807 333 4444' },
];

const BANNERS = [
  {
    title: 'Quality gadgets, smarter living.',
    subtitle: 'New season drop — phone accessories built to last.',
    description: 'Cases, chargers, earbuds and more, hand-picked for the Lagos commute and beyond.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600',
    mobileImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900',
    ctaText: 'Shop the drop',
    ctaLink: '/shop',
    placement: 'hero',
    position: 1,
    bg: '#0B0F1A',
  },
  {
    title: 'NovaCharge GaN III — 65W, three devices, one brick.',
    subtitle: 'Fast charging for laptop, phone and earbuds.',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1600',
    ctaText: 'See the charger',
    ctaLink: '/shop/chargers',
    placement: 'promo',
    position: 2,
    bg: '#1A1F2E',
  },
  {
    title: 'Save up to 25% on Power Banks this week.',
    subtitle: 'Stay charged past sunset.',
    image: 'https://images.unsplash.com/photo-1609592424823-bd5b6b9d4f9c?w=1600',
    ctaText: 'Browse deals',
    ctaLink: '/shop?onSale=true',
    placement: 'midpage',
    position: 3,
    bg: '#0B0F1A',
  },
];

const COUPONS = [
  {
    code: 'NOVA10',
    description: '10% off your first order',
    type: 'percent',
    value: 10,
    minOrder: 10000,
    maxDiscount: 10000,
    usageLimit: 1000,
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'LEKKI5000',
    description: '₦5,000 off orders above ₦50,000',
    type: 'fixed',
    value: 5000,
    minOrder: 50000,
    usageLimit: 200,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

const run = async () => {
  try {
    await connectDB();
    console.log('  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Banner.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // ---- Admin ----
   // const adminPassword = await bcrypt.hash('admin12345', 12);
    const admin = await User.create({
      name: 'NovaTech Admin',
      email: 'admin@novatech.com',
      password: 'admin12345',
      role: 'admin',
      phone: '+234 801 234 5678',
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`  Admin created: ${admin.email} / admin12345`);

    // ---- Customers ----
    const customers = [];
    for (const c of TESTIMONIALS_SEED_USERS) {
     // const pwd = await bcrypt.hash(c.password, 12);
      const u = await User.create({ ...c, role: 'customer' });
      customers.push(u);
    }
    console.log(`  ${customers.length} sample customers created.`);

    // ---- Categories ----
    const categoryMap = new Map();
    for (const c of CATEGORIES) {
      const cat = await Category.create(c);
      categoryMap.set(cat.name, cat);
    }
    console.log(`  ${categoryMap.size} categories created.`);

    // ---- Products ----
    const productSpecToObj = (specs) => specs.map(([label, value]) => ({ label, value }));
    for (const p of PRODUCTS) {
      const cat = categoryMap.get(p.category);
      if (!cat) {
        console.warn(`  Skipping "${p.title}" — missing category ${p.category}`);
        continue;
      }
      const { specs, ...rest } = p;
      const product = await Product.create({
        ...rest,
        category: cat._id,
        specifications: productSpecToObj(specs),
      });

      // Reviews
      if (product.isFeatured || product.soldCount > 200) {
        const reviewPool = [
          { user: customers[0], name: customers[0].name, rating: 5, title: 'Exactly what I needed', comment: 'Build quality is excellent and delivery was faster than I expected. Will buy from NovaTech again.' },
          { user: customers[1], name: customers[1].name, rating: 4, title: 'Solid product', comment: 'Works as described. Took one star off because the packaging could be a bit greener.' },
          { user: customers[2], name: customers[2].name, rating: 5, title: 'Best in this price range', comment: 'I have tried two other brands and this is by far the best value for money in Lagos right now.' },
        ];
        for (const r of reviewPool) {
          product.reviews.push(r);
        }
        product.updateRating();
        await product.save();
      }
    }
    console.log(`  ${PRODUCTS.length} products created with reviews.`);

    // ---- Banners ----
    for (const b of BANNERS) {
      await Banner.create(b);
    }
    console.log(`  ${BANNERS.length} banners created.`);

    // ---- Coupons ----
    for (const c of COUPONS) {
      await Coupon.create(c);
    }
    console.log(`  ${COUPONS.length} coupons created.`);

    // ---- Sample order ----
    const sampleProduct = await Product.findOne({ sku: 'NG-IP15P-MS-BK' });
    if (sampleProduct) {
      await Order.create({
        user: customers[0]._id,
        items: [{
          product: sampleProduct._id,
          title: sampleProduct.title,
          slug: sampleProduct.slug,
          sku: sampleProduct.sku,
          image: sampleProduct.images?.[0] || '',
          price: sampleProduct.price,
          salePrice: sampleProduct.salePrice || null,
          quantity: 1,
          color: 'Midnight Black',
        }],
        shippingAddress: {
          fullName: customers[0].name,
          phone: customers[0].phone,
          line1: '12 Admiralty Way',
          line2: 'Lekki Phase 1',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
        },
        payment: { method: 'cash_on_delivery', status: 'pending' },
        subtotal: sampleProduct.salePrice || sampleProduct.price,
        shippingCost: 2500,
        tax: 0,
        discount: 0,
        total: (sampleProduct.salePrice || sampleProduct.price) + 2500,
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
    }
    console.log('  Sample order created.');

    console.log('\n  Seed complete. Admin login: admin@novatech.com / admin12345');
    process.exit(0);
  } catch (err) {
    console.error('  Seed failed:', err.message);
    process.exit(1);
  }
};

run();