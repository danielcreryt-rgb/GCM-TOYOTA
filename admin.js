
const firebaseConfig = {
  apiKey: "AIzaSyAYiRnS9eNTXI-SSZrAy3jgAFTSR0UGhCk",
  authDomain: "gcm-web1.firebaseapp.com",
  projectId: "gcm-web1",
  storageBucket: "gcm-web1.firebasestorage.app",
  messagingSenderId: "240640122521",
  appId: "1:240640122521:web:b62bebed82cb6f9518a208",
  measurementId: "G-LSSKB9XLRW"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();


const appBody = document.getElementById('app-body');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const inventoryList = document.getElementById('inventory-list');
const vehicleForm = document.getElementById('vehicle-form');
const saveBtn = document.getElementById('save-btn');
const saveText = document.getElementById('save-text');

let currentVehicles = [];


const _0x4f2a = atob('NDkzZDVmYjIyMjRjOTE0YzgwODZmYzgzZTcyYTc5MTI=');
const IMGBB_API_KEY = _0x4f2a;


const imageFileInput = document.getElementById('image-file');
const previewGrid = document.getElementById('preview-grid');
const currentImagesJson = document.getElementById('current-images-json');

// Custom Brand Logic
const brandSelect = document.getElementById('brand');
const customBrandContainer = document.getElementById('custom-brand-container');
const customBrandInput = document.getElementById('custom-brand');
const predefinedBrands = ['RAM','Ford','Chevrolet','Nissan','Toyota','Honda','Volkswagen','Jeep','Suzuki','MG','Chirey','Mercedes-Benz'];

brandSelect.addEventListener('change', () => {
    if (brandSelect.value === 'Otra') {
        customBrandContainer.classList.remove('hidden');
        customBrandInput.required = true;
        customBrandInput.focus();
    } else {
        customBrandContainer.classList.add('hidden');
        customBrandInput.required = false;
        customBrandInput.value = '';
    }
});

if(imageFileInput) {
    imageFileInput.addEventListener('change', function() {
        if(!previewGrid) return;
        previewGrid.innerHTML = '';
        const files = Array.from(this.files);
        
        if (files.length > 0) {
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'w-full aspect-video object-cover rounded-xl border border-zinc-200 shadow-sm';
                    previewGrid.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
        } else {
            renderCurrentImages();
        }
    });
}

window.renderCurrentImages = function() {
    if (!previewGrid) return;
    previewGrid.innerHTML = '';
    try {
        const urls = JSON.parse(currentImagesJson.value || '[]');
        if (urls.length > 0) {
            urls.forEach(url => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'relative group aspect-video';
                
                const img = document.createElement('img');
                img.src = url;
                img.className = 'w-full h-full object-cover rounded-xl border border-zinc-200 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity';
                img.onerror = () => { img.src = 'https://via.placeholder.com/400x300?text=Error+Imagen'; };
                
                imgContainer.appendChild(img);
                previewGrid.appendChild(imgContainer);
            });
        } else {
            previewGrid.innerHTML = '<div class="w-full aspect-video rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-xs font-bold col-span-full">Sin Fotos Guardadas</div>';
        }
    } catch(e) {
        console.error("Render Error:", e);
        previewGrid.innerHTML = '<div class="w-full aspect-video rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-xs font-bold col-span-full">Error al cargar miniaturas</div>';
    }
}


auth.onAuthStateChanged((user) => {
    if (user) {

        appBody.classList.remove('hidden');
        userEmailSpan.textContent = user.email;
        loadInventory();
    } else {

        window.location.href = 'login.html';
    }
});


logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});


async function loadInventory() {
    try {
        const querySnapshot = await db.collection("inventory").get();
        currentVehicles = [];
        inventoryList.innerHTML = '';

        if (querySnapshot.empty) {
            inventoryList.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-zinc-400">No hay vehículos registrados. ¡Añade uno nuevo!</td></tr>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            currentVehicles.push(data);
            
            const tr = document.createElement('tr');
            tr.className = "border-b border-zinc-100 hover:bg-zinc-50 transition-colors";
            

            const formattedPrice = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(data.price);
            const oldPriceHtml = data.oldPrice ? `<br><span class="text-[10px] text-zinc-400 line-through">$${data.oldPrice.toLocaleString()}</span>` : '';
            

            const statusBadge = data.isActive 
                ? `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Público</span>`
                : `<span class="bg-zinc-200 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Oculto</span>`;
                
            const isOffer = data.isOffer === true || (data.isOffer === undefined && data.oldPrice > 0);
            const offerBadge = isOffer
                ? `<br><span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-2 inline-block">🔥 Oferta</span>`
                : '';

            tr.innerHTML = `
                <td class="p-4 pl-6">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-12 rounded-lg bg-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                            <img src="${data.imageMain || 'https://via.placeholder.com/150?text=Sin+Foto'}" class="w-full h-full object-cover" alt="Car" onerror="this.src='https://via.placeholder.com/150?text=Error'">
                        </div>
                        <div>
                            <div class="font-bold text-sm text-zinc-900">${data.brand} ${data.model}</div>
                            <div class="text-[10px] text-zinc-500 uppercase tracking-widest">${data.year} • ${data.type}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4 text-sm font-bold text-orange-600">
                    ${formattedPrice}
                    ${oldPriceHtml}
                </td>
                <td class="p-4 text-xs text-zinc-500">
                    <div>${data.km} km</div>
                    <div>${data.transmission}</div>
                </td>
                <td class="p-4 text-center">
                    ${statusBadge}
                    ${offerBadge}
                </td>
                <td class="p-4 pr-6 text-right space-x-2">
                    <button onclick="editVehicle('${data.id}')" class="text-zinc-400 hover:text-orange-600 transition-colors" title="Editar">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onclick="deleteVehicle('${data.id}')" class="text-zinc-400 hover:text-red-600 transition-colors" title="Eliminar">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </td>
            `;
            inventoryList.appendChild(tr);
        });
    } catch (error) {

        inventoryList.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-500">Error al cargar datos. Verifica la conexión o las reglas de Firestore.</td></tr>`;
    }
}


vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    saveBtn.disabled = true;
    saveText.textContent = "Subiendo foto...";
    const imageLoading = document.getElementById('image-loading');
    if (imageLoading) {
        imageLoading.classList.remove('hidden');
        imageLoading.classList.add('flex');
    }

    const id = document.getElementById('vehicle-id').value;
    
    let finalImageUrls = [];
    try {
        finalImageUrls = JSON.parse(currentImagesJson.value || '[]');
    } catch(e) { finalImageUrls = []; }
    
    const files = imageFileInput.files;

    try {

        if (files && files.length > 0) {
            const uploadedUrls = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                document.getElementById('loading-text').textContent = `Subiendo foto ${i + 1} de ${files.length}...`;
                
                const formData = new FormData();
                formData.append('image', file);
                
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    // Usamos 'url' que es el link directo. 'display_url' es otro backup bueno.
                    uploadedUrls.push(data.data.url);
                } else {
                    console.error("ImgBB Error:", data);
                    throw new Error("Error al subir imagen a ImgBB");
                }
            }
            // Si el usuario subió fotos nuevas, reemplazamos las anteriores (comportamiento actual)
            // Si quieres que se sumen, usarías finalImageUrls.push(...uploadedUrls)
            finalImageUrls = uploadedUrls;
        }
        
        if (finalImageUrls.length === 0) {
            finalImageUrls = ["https://via.placeholder.com/800x600?text=Sin+Foto"];
        }
        
        saveText.textContent = "Guardando info...";

        const vehicleData = {
            brand: document.getElementById('brand').value === 'Otra' ? customBrandInput.value.trim() : document.getElementById('brand').value,
            model: document.getElementById('model').value,
            year: document.getElementById('year').value,
            type: document.getElementById('type').value,
            price: Number(document.getElementById('price').value),
            oldPrice: document.getElementById('old-price').value ? Number(document.getElementById('old-price').value) : null,
            transmission: document.getElementById('transmission').value,
            fuel: document.getElementById('fuel').value,
            km: document.getElementById('km').value,
            engine: document.getElementById('engine').value,
            hp: document.getElementById('hp').value,
            capacity: document.getElementById('capacity').value,
            description: document.getElementById('description').value,
            isActive: document.getElementById('is-active').checked,
            isOffer: document.getElementById('is-offer').checked,
            imageMain: finalImageUrls[0],
            images: finalImageUrls,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (id) {
            await db.collection("inventory").doc(id).update(vehicleData);
        } else {
            await db.collection("inventory").add(vehicleData);
        }


        document.getElementById('vehicle-modal').classList.add('hidden');
        await loadInventory();
        
    } catch (error) {

        alert("Hubo un error al guardar o al subir la imagen. Intenta de nuevo.");
    } finally {
        saveBtn.disabled = false;
        saveText.textContent = "Guardar Vehículo";
        if (imageLoading) {
            imageLoading.classList.add('hidden');
            imageLoading.classList.remove('flex');
        }
    }
});


window.editVehicle = (id) => {
    const vehicle = currentVehicles.find(v => v.id === id);
    if (!vehicle) return;

    document.getElementById('vehicle-id').value = vehicle.id;
    // Check if the brand is in the predefined list
    if (predefinedBrands.includes(vehicle.brand)) {
        document.getElementById('brand').value = vehicle.brand;
        customBrandContainer.classList.add('hidden');
        customBrandInput.required = false;
        customBrandInput.value = '';
    } else {
        document.getElementById('brand').value = 'Otra';
        customBrandContainer.classList.remove('hidden');
        customBrandInput.required = true;
        customBrandInput.value = vehicle.brand || '';
    }
    document.getElementById('model').value = vehicle.model || '';
    document.getElementById('year').value = vehicle.year || '';
    document.getElementById('type').value = vehicle.type || '';
    document.getElementById('price').value = vehicle.price || '';
    document.getElementById('old-price').value = vehicle.oldPrice || '';
    document.getElementById('transmission').value = vehicle.transmission || 'Automática';
    document.getElementById('fuel').value = vehicle.fuel || 'Gasolina';
    document.getElementById('km').value = vehicle.km || '';
    document.getElementById('engine').value = vehicle.engine || '';
    document.getElementById('hp').value = vehicle.hp || '';
    document.getElementById('capacity').value = vehicle.capacity || '';
    document.getElementById('description').value = vehicle.description || '';
    
    const isActiveCheck = document.getElementById('is-active');
    isActiveCheck.checked = vehicle.isActive !== false;
    isActiveCheck.dispatchEvent(new Event('change'));

    const isOfferCheck = document.getElementById('is-offer');
    isOfferCheck.checked = vehicle.isOffer === true || (vehicle.isOffer === undefined && vehicle.oldPrice > 0);
    isOfferCheck.dispatchEvent(new Event('change'));

    if (imageFileInput) imageFileInput.value = '';
    
    let editImages = vehicle.images || [];
    if(editImages.length === 0 && vehicle.imageMain) editImages = [vehicle.imageMain];
    
    if (currentImagesJson) currentImagesJson.value = JSON.stringify(editImages);
    if (window.renderCurrentImages) window.renderCurrentImages();

    document.getElementById('modal-title').textContent = 'Editar Vehículo';
    document.getElementById('vehicle-modal').classList.remove('hidden');
};


window.deleteVehicle = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este vehículo por completo? (Recomendamos "Ocultarlo" editándolo)')) {
        try {
            await db.collection("inventory").doc(id).delete();
            await loadInventory();
        } catch (error) {

            alert("Error al eliminar.");
        }
    }
};
