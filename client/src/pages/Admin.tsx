import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ChevronDown, Eye, ImagePlus, LayoutDashboard, LogIn, MoreHorizontal, Pencil, Plus, Search, Settings2, Star, Trash2, Utensils, X, Power, Lock } from "lucide-react";
import { menuCategories } from "@shared/menuSeed";
import { trpc } from "@/lib/trpc";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  description: string;
  available: boolean;
  image?: string;
  tag?: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);

  const [activeTab, setActiveTab] = useState("Menu items");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    category: "Thali",
    description: "",
    image: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const utils = trpc.useContext();

  // Queries & Mutations
  const menuQuery = trpc.menu.list.useQuery(undefined, { enabled: isAuthenticated });
  const settingsQuery = trpc.business.info.useQuery(undefined, { enabled: isAuthenticated });
  const reviewsQuery = trpc.reviews.list.useQuery(undefined, { enabled: isAuthenticated });

  const createMenuMutation = trpc.menu.create.useMutation({
    onSuccess: () => {
      utils.menu.list.invalidate();
      closeModal();
    },
    onError: (err) => {
      console.error("Dish create error:", err);
      alert("Dish add karne mein issue aaya. Console check karo!");
    }
  });

  const updateMenuMutation = trpc.menu.update.useMutation({
    onSuccess: () => {
      utils.menu.list.invalidate();
      closeModal();
    }
  });

  const deleteMenuMutation = trpc.menu.remove.useMutation({
    onSuccess: () => {
      utils.menu.list.invalidate();
    }
  });

  const deleteReviewMutation = trpc.reviews.remove.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate();
    }
  });

  const settingsUpdate = trpc.business.update.useMutation({
    onSuccess: () => {
      utils.business.info.invalidate();
    }
  });

  const [settingsForm, setSettingsForm] = useState({
    id: 0,
    businessName: "The Rasoi Veg. Cuisine",
    phone: "8006771779",
    location: "Haridwar, Uttarakhand, India",
    hours: "7:00 AM to 9:00 PM",
    orderingNote: "Pure vegetarian · Cloud Kitchen · No Dine-In · Order on Zomato & Swiggy",
    isOpen: true
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "rasoi123") {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const items: MenuItem[] = useMemo(() => {
    if (!menuQuery.data || !Array.isArray(menuQuery.data)) return [];
    
    return menuQuery.data.map((item: any) => ({
      id: item.id,
      name: item.name || "Unnamed Dish",
      category: item.category || item.categoryName || item.categoryId || "Thali",
      description: item.description || "",
      available: item.available === true || item.available === 1 || item.available === undefined,
      image: item.imageUrl || item.image || ""
    }));
  }, [menuQuery.data]);

  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

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

  const toggleItemStatus = (item: MenuItem) => {
    updateMenuMutation.mutate({
      id: item.id,
      available: item.available ? 0 : 1
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormState((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormState({ name: "", category: "Thali", description: "", image: "" });
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormState({
      name: item.name,
      category: item.category,
      description: item.description,
      image: item.image || ""
    });
    setImagePreview(item.image || null);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormState({ name: "", category: "Thali", description: "", image: "" });
    setImagePreview(null);
  };

  // 💥 Image & Description are now OPTIONAL
  const handleSaveDish = () => {
    if (!formState.name.trim()) {
      alert("Kripya dish ka naam bharein.");
      return;
    }

    const payload: any = {
      name: formState.name,
      category: formState.category,
      description: formState.description || "Fresh & Authentic",
      available: 1
    };

    // Photo ho tabhi URL bhejenge
    if (formState.image) {
      payload.imageUrl = formState.image;
    }

    if (editingItem) {
      updateMenuMutation.mutate({
        id: editingItem.id,
        ...payload
      });
    } else {
      createMenuMutation.mutate(payload);
    }
  };

  const handleDeleteDish = (id: number) => {
    if (confirm("Are you sure you want to delete this dish?")) {
      deleteMenuMutation.mutate({ id });
    }
  };

  const handleDeleteReview = (id: number) => {
    if (confirm("Kya aap is review ko delete karna chahte hain?")) {
      deleteReviewMutation.mutate({ id });
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full space-y-4 text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Owner Access</h2>
          <p className="text-xs text-gray-500">Enter passcode to access kitchen workspace.</p>
          <input
            type="password"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full p-3 border rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {passError && <p className="text-red-500 text-xs">Incorrect passcode!</p>}
          <button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 text-white p-3 rounded-lg font-medium transition">
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          <span className="wordmark-mark">रसोई</span>
          <span><b>The Rasoi</b><small>owner workspace</small></span>
        </Link>
        <div className="admin-user">
          <span className="admin-avatar">TR</span>
          <span><b>Kitchen admin</b><small>Haridwar, IN</small></span>
          <ChevronDown size={14} />
        </div>
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
        <div className="admin-side-bottom">
          <Link href="/"><ArrowLeft size={16} /> View live site</Link>
          <button onClick={() => setIsAuthenticated(false)}><LogIn size={16} /> Lock panel</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div><p className="admin-kicker">The Rasoi / Admin</p><h1>{activeTab}</h1></div>
          <div className="admin-top-actions">
            <Link href="/" className="icon-button" aria-label="Preview site"><Eye size={18} /></Link>
            <button className="button button-burgundy" onClick={openAddModal}><Plus size={17} /> Add dish</button>
          </div>
        </header>

        {activeTab === "Menu items" && (
          <>
            <div className="admin-stats">
              <div><span>Total dishes</span><b>{items.length}</b><small>Across categories</small></div>
              <div><span>Available now</span><b>{items.filter((item) => item.available).length}</b><small className="green-text">Live on menu</small></div>
              <div><span>Model Type</span><b>Cloud Kitchen</b><small>No Dine-In · Zomato/Swiggy Only</small></div>
              <div><span>Open hours</span><b>7–9</b><small>Every day · takeaway</small></div>
            </div>
            <div className="admin-panel">
              <div className="panel-heading">
                <div><h2>Menu inventory</h2><p>Manage dishes, photos and kitchen availability.</p></div>
                <div className="panel-tools">
                  <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes" /></label>
                  <button className="icon-button"><MoreHorizontal size={18} /></button>
                </div>
              </div>
              <div className="admin-table">
                <div className="table-row table-head"><span>Dish</span><span>Category</span><span>Status</span><span>Actions</span></div>
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No dishes found in inventory.</div>
                ) : (
                  filtered.map((item) => (
                    <div className="table-row" key={item.id}>
                      <div className="dish-cell">
                        <div className="dish-thumb">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" /> : <Utensils size={16} />}
                        </div>
                        <span><b>{item.name}</b><small>{item.description}</small></span>
                      </div>
                      <span className="category-cell">{item.category}</span>
                      <button className={`status-pill ${item.available ? "live" : "paused"}`} onClick={() => toggleItemStatus(item)}>
                        <span />{item.available ? "Available" : "Paused"}
                      </button>
                      <div className="row-actions">
                        <button aria-label={`Edit ${item.name}`} onClick={() => openEditModal(item)}><Pencil size={15} /></button>
                        <button aria-label={`Delete ${item.name}`} onClick={() => handleDeleteDish(item.id)}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "Overview" && (
          <div className="empty-admin">
            <div className="empty-icon"><LayoutDashboard size={28} /></div>
            <h2>Good morning, Rasoi.</h2>
            <p>Your overview will show analytics and top dishes once live traffic starts flowing from Zomato and Swiggy.</p>
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
                  <div key={rev.id} className="p-4 border rounded-lg flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition">
                    <div>
                      <div className="flex gap-1 text-amber-500 mb-1">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p className="font-medium text-gray-800">“{rev.quote || rev.content}”</p>
                      <small className="text-gray-500">— {rev.name || rev.authorName}</small>
                    </div>
                    <button 
                      onClick={() => handleDeleteReview(rev.id)}
                      disabled={deleteReviewMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                      title="Delete review"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
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
              <span><Check size={15} /> Pure Cloud Kitchen (No Dine-In)</span>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="admin-kicker">Menu inventory</span><h2>{editingItem ? "Edit dish" : "Add a new dish"}</h2></div>
              <button className="icon-button" onClick={closeModal}><X size={18} /></button>
            </div>
            <label>Dish name *<input value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} placeholder="e.g. Special Paneer Thali" /></label>
            <label>Category<select value={formState.category} onChange={(event) => setFormState({ ...formState, category: event.target.value })}>{menuCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Description (Optional)<textarea value={formState.description} onChange={(event) => setFormState({ ...formState, description: event.target.value })} placeholder="What makes it special?" /></label>
            
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
                  <span>Upload food image (Optional) <small className="block text-xs text-gray-500">JPG, PNG up to 5MB</small></span>
                </div>
              )}
            </label>

            <div className="modal-actions">
              <button className="button button-outline" onClick={closeModal}>Cancel</button>
              <button className="button button-burgundy" onClick={handleSaveDish} disabled={createMenuMutation.isPending || updateMenuMutation.isPending}>
                <Check size={16} /> {editingItem ? "Update dish" : "Save dish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}