import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addMenuItem, editMenuItem, fetchMenu } from "../../../app/slices/menuSlice";
import { ArrowLeft, Upload, Save, Loader2, Info, X, Utensils } from "lucide-react";
import toast from "react-hot-toast";

const AddMenu: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(id);

  const { items, isLoading } = useAppSelector((state) => state.menu);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    foodName: "",
    category: "Main Dish",
    price: "",
    description: "",
  });

  useEffect(() => {
    if (isEdit) {
      if (items.length === 0) {
        dispatch(fetchMenu());
      } else {
        const item = items.find((i) => String(i.id) === String(id));
        if (item) {
          setFormData({
            foodName: item.foodName,
            category: item.category || "Main Dish",
            price: item.price.toString(),
            description: item.description || "",
          });
          setPreview(item.imageUrl || "");
        }
      }
    }
  }, [id, items, isEdit, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic size check (e.g., 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error("File is too large (Max 2MB)");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("foodName", formData.foodName);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("description", formData.description);
    
    // Key: ensure this matches your backend field name (usually 'image' or 'imageUrl')
    if (file) {
      data.append("image", file);
    }

    try {
      if (isEdit && id) {
        await dispatch(editMenuItem({ id: Number(id), formData: data })).unwrap();
        toast.success("Dish updated successfully");
      } else {
        await dispatch(addMenuItem(data)).unwrap();
        toast.success("New dish published");
      }
      navigate("/admin/menu");
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu item");
    }
  };

  return (
    <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={() => navigate("/admin/menu")} 
        className="group flex items-center gap-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-600 mb-10 transition-all"
      >
        <div className="p-2 bg-white rounded-lg group-hover:bg-red-50 transition-colors">
          <ArrowLeft size={14} /> 
        </div>
        Back to Inventory
      </button>

      <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-2xl shadow-gray-100/50 relative overflow-hidden">
        {/* Design Element */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Utensils size={200} />
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">
            {isEdit ? "Refine" : "Create"} <span className="text-red-600">Product</span>
          </h2>
          <p className="text-gray-400 font-bold text-sm mb-12">Configure dish details and pricing for students.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* LEFT: Image Upload */}
            <div className="lg:col-span-5 space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Info size={12} /> Product Visual
              </label>
              <div className="relative aspect-square rounded-[3rem] bg-slate-50 border-4 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden group hover:border-red-100 transition-all">
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => {setPreview(""); setFile(null);}}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-10">
                    <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="text-red-600" size={28} />
                    </div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Upload Photo</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">JPG, PNG or WEBP</p>
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                />
              </div>
            </div>

            {/* RIGHT: Form Data */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Dish Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Traditional Ugali & Sukuma"
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-gray-900 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-gray-300"
                  value={formData.foodName}
                  onChange={(e) => setFormData({...formData, foodName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Price (Ksh)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-sm">KES</span>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-14 font-black text-gray-900 focus:ring-4 focus:ring-red-600/10 transition-all"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Classification</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 font-black text-gray-900 focus:ring-4 focus:ring-red-600/10 transition-all appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Main Dish</option>
                    <option>Snacks</option>
                    <option>Drinks</option>
                    <option>Breakfast</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Tell students about ingredients or prep time..."
                  className="w-full bg-slate-50 border-none rounded-3xl p-5 font-bold text-gray-900 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-gray-300 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 hover:bg-red-600 transition-all active:scale-95 shadow-2xl shadow-gray-200 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span className="tracking-widest uppercase text-xs">
                  {isEdit ? "Update Menu Record" : "Publish to Canteen"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;