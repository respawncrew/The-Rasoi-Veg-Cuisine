import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ChevronDown, Eye, ImagePlus, LayoutDashboard, LogIn, MoreHorizontal, Pencil, Plus, Search, Settings2, Star, Trash2, Utensils, X, Power } from "lucide-react";
import { menuCategories, menuSeed } from "@shared/menuSeed";
import { trpc } from "@/lib/trpc";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  description: string;
  price?: string;
  available: boolean;
  image?: string;
  tag?: string;
}

const seedItems: MenuItem[] = menuSeed.map((item, index) => ({
  ...item,
  id: index + 1,
  available: true,
  image: ""
}));

export default function Admin() {
  const [items, setItems] = useState<MenuItem[]>(seedItems);
  const [activeTab, setActiveTab] = useState("Menu items");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Thali", description: "", price: "₹150", image: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const utils = trpc.useContext();
  const settingsQuery = trpc.business.info.useQuery();
  const settingsUpdate = trpc.business.update.useMutation({
    onSuccess: () => {
      utils.business.info.invalidate();
    }
  });

  const reviewsQuery = trpc.reviews.list.useQuery({ approvedOnly: false });

  const [settingsForm, setSettingsForm] = useState({
    id: 0,
    businessName: "The Rasoi Veg. Cuisine",
    phone: "8006771779",
    location: "Haridwar, Uttarakhand, India",
    hours: "7:00 AM to 9:00 PM",
    orderingNote: "Pure vegetarian · Takeaway available · Order on Zomato and Swiggy",
    isOpen: true
  });

  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [items, search]);

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsForm({
        id: settingsQuery.data.id,
        businessName: settingsQuery.data.businessName,
        phone: settingsQuery.data.phone,
        location: settingsQuery.data.location,
        hours: settingsQuery.data.hours,
        orderingNote: settingsQuery.data.orderingNote ?? "",
        isOpen: settingsQuery.data.takeawayAvailable === 1
      });
    }
  }, [settingsQuery.data]);

  const toggleItem = (id: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, available: !item.available } : item));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setNewItem((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setItems((current) => [
      ...current,
      {
        id: Date.now(),
        name: newItem.name,
        category: newItem.category,
        description: newItem.description,
        price: newItem.price || "₹150",
        available: true,
        image: newItem.image
      }
    ]);
    setNewItem({ name: "", category: "Thali", description: "", price: "₹150", image: "" });
    setImagePreview(null);
    setShowForm(false);
  };

  const saveSettings = () => {
    if (!settingsForm.id) return;
    settingsUpdate.mutate({
      id: settingsForm.id,
      businessName: settingsForm.businessName,
      phone: settingsForm.phone,
      location: settingsForm.location,
      hours: settingsForm.hours,
      orderingNote: settingsForm.orderingNote,
      pureVegetarian: 1,
      takeawayAvailable: settingsForm.isOpen ? 1 : 0,
      zomatoUrl: "https://www.zomato.com/",
      swiggyUrl: "https://www.swiggy.com/"
    });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand"><span className="wordmark-mark">रसोई</span><span><b>The Rasoi</b><small>owner workspace</small></span></Link>
        <div className="admin-user"><span className="admin-avatar">TR</span><span><b>Kitchen admin</b><small>Haridwar, IN</small></span><ChevronDown size={14} /></div>
        <nav className="admin-nav">
          {[<LayoutDashboard key="ov" size={17} />, <Utensils key="menu" size={17} />, <Star key="rev" size={17} />, <Settings2 key="set" size={17} />].map((icon, index) => {
            const label = ["Overview", "Menu items", "Reviews", "Settings"][index];
            return (
              <button key={label} className={activeTab === label ? "active" : ""} onClick={() => setActiveTab(label)}>
                {icon}<span>{label}</span>{label === "Reviews" && <i>{reviewsQuery.data?.length || 0}</i>}
              </button>
            );
          })}
        </nav>
        <div className="admin-side-bottom"><Link href="/"><ArrowLeft size={16} /> View live site</Link><button><LogIn size={16} /> Sign out</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div><p className="admin-kicker">The Rasoi / Admin</p><h1>{activeTab}</h1></div>
          <div className="admin-top-actions">
            <Link href="/" className="icon-button" aria-label="Preview site"><Eye size={18} /></Link>
            <button className="button button-burgundy" onClick={() => setShowForm(true)}><Plus size={17} /> Add dish</button>
          </div>
        </header>

        {activeTab === "Menu items" && (
          <>
            <div className="admin-stats">
              <div><span>Total dishes</span><b>{items.length}</b><small>Across {menuCategories.length} categories</small></div>
              <div><span>Available now</span><b>{items.filter((item) => item.available).length}</b><small className="green-text">Live on menu</small></div>
              <div><span>Price updates</span><b>83</b><small>Authoritative prices loaded</small></div>
              <div><span>Open hours</span><b>7–9</b><small>Every day · takeaway</small></div>
            </div>
            <div className="admin-panel">
              <div className="panel-heading">
                <div><h2>Menu inventory</h2><p>Edit dishes, prices and availability from one place.</p></div>
                <div className="panel-tools">
                  <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes" /></label>
                  <button className="icon-button"><MoreHorizontal size={18} /></button>
                </div>
              </div>
              <div className="admin-table">
                <div className="table-row table-head"><span>Dish</span><span>Category</span><span>Price</span><span>Status</span><span></span></div>
                {filtered.map((item) => (
                  <div className="table-row" key={item.id}>
                    <div className="dish-cell">
                      <div className="dish-thumb">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" /> : <Utensils size={16} />}
                      </div>
                      <span><b>{item.name}</b><small>{item.description}</small></span>
                    </div>
                    <span className="category-cell">{item.category}</span>
                    <span className="price-cell">{item.price}</span>
                    <button className={`status-pill ${item.available ? "live" : "paused"}`} onClick={() => toggleItem(item.id)}>
                      <span />{item.available ? "Available" : "Paused"}
                    </button>
                    <div className="row-actions">
                      <button aria-label={`Edit ${item.name}`}><Pencil size={15} /></button>
                      <button aria-label={`Delete ${item.name}`} onClick={() => setItems(items.filter((current) => current.id !== item.id))}><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "Overview" && (
          <div className="empty-admin">
            <div className="empty-icon"><LayoutDashboard size={28} /></div>
            <h2>Good morning, Rasoi.</h2>
            <p>Your overview will show orders, enquiries and top dishes once the kitchen starts receiving live data.</p>
            <button className="button button-burgundy" onClick={() => setActiveTab("Menu items")}>Manage menu <ArrowLeft size={16} /></button>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="admin-panel p-6 space-y-4">
            <div className="panel-heading">
              <div><h2>Customer Reviews</h2><p>Submitted reviews from users.</p></div>
            </div>
            {!reviewsQuery.data || reviewsQuery.data.length === 0 ? (
              <p className="text-gray-500 py-4">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {reviewsQuery.data.map((rev: any) => (
                  <div key={rev.id} className="p-4 border rounded-lg flex items-center justify-between bg-white shadow-sm">
                    <div>
                      <div className="flex gap-1 text-amber-500 mb-1">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p className="font-medium text-gray-800">“{rev.quote || rev.content}”</p>
                      <small className="text-gray-500">— {rev.name || rev.authorName} · {rev.approved ? "Approved" : "Pending Approval"}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="settings-form">
            <div className="settings-form-heading">
              <div><span className="admin-kicker">Editable business settings</span><h2>Keep the public site in sync.</h2><p>These values are saved through the backend and shown across the ordering experience.</p></div>
              <button className="button button-burgundy" onClick={saveSettings} disabled={settingsUpdate.isPending}>
                {settingsUpdate.isPending ? "Saving..." : settingsUpdate.isSuccess ? "Saved!" : "Save changes"}
              </button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between mb-4">
              <div>
                <b className="block text-base">Kitchen Store Status</b>
                <span className="text-sm text-gray-600">Currently: <strong className={settingsForm.isOpen ? "text-green-600" : "text-red-600"}>{settingsForm.isOpen ? "OPEN 🟢" : "CLOSED 🔴"}</strong></span>
              </div>
              <button 
                type="button" 
                className={`button flex items-center gap-2 ${settingsForm.isOpen ? "button-burgundy" : "button-outline"}`}
                onClick={() => setSettingsForm({ ...settingsForm, isOpen: !settingsForm.isOpen })}
              >
                <Power size={16} /> Toggle {settingsForm.isOpen ? "Close Kitchen" : "Open Kitchen"}
              </button>
            </div>

            <div className="settings-fields">
              <label>Brand name<input value={settingsForm.businessName} onChange={(event) => setSettingsForm({ ...settingsForm, businessName: event.target.value })} /></label>
              <label>Phone / WhatsApp<input value={settingsForm.phone} onChange={(event) => setSettingsForm({ ...settingsForm, phone: event.target.value })} /></label>
              <label>Location<input value={settingsForm.location} onChange={(event) => setSettingsForm({ ...settingsForm, location: event.target.value })} /></label>
              <label>Order timing<input value={settingsForm.hours} onChange={(event) => setSettingsForm({ ...settingsForm, hours: event.target.value })} /></label>
              <label className="settings-wide">Ordering note<textarea value={settingsForm.orderingNote} onChange={(event) => setSettingsForm({ ...settingsForm, orderingNote: event.target.value })} /></label>
            </div>
            <div className="settings-flags">
              <span><Check size={15} /> Pure vegetarian</span>
              <span><Check size={15} /> Takeaway available</span>
              <span><Check size={15} /> Online ordering on Zomato + Swiggy</span>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="admin-kicker">Menu inventory</span><h2>Add a new dish</h2></div>
              <button className="icon-button" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <label>Dish name<input value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} placeholder="e.g. Aloo Paratha" /></label>
            <label>Category<select value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })}>{menuCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Price<input value={newItem.price} onChange={(event) => setNewItem({ ...newItem, price: event.target.value })} placeholder="e.g. ₹180" /></label>
            <label>Description<textarea value={newItem.description} onChange={(event) => setNewItem({ ...newItem, description: event.target.value })} placeholder="What makes it special?" /></label>
            
            <label className="upload-placeholder cursor-pointer block border-2 border-dashed rounded-lg p-4 text-center hover:bg-black/5 transition relative">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {imagePreview ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  <span className="text-sm font-medium">Image selected! Click to change.</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImagePlus size={22} />
                  <span>Upload food image <small className="block text-xs text-gray-500">JPG, PNG up to 5MB</small></span>
                </div>
              )}
            </label>

            <div className="modal-actions">
              <button className="button button-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="button button-burgundy" onClick={addItem}><Check size={16} /> Save dish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}