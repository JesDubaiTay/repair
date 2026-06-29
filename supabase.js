// Локальный мини-драйвер Supabase для обхода блокировок CDN
window.supabase = {
  createClient: function(url, key) {
    return {
      from: function(tableName) {
        return {
          insert: async function(dataArray) {
            const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
            const endpoint = `${cleanUrl}/rest/v1/${tableName}`;
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(dataArray)
            });

            if (!response.ok) {
              const errData = await response.json();
              return { data: null, error: new Error(errData.message || 'Supabase Error') };
            }

            const resData = await response.json();
            return { data: resData, error: null };
          }
        };
      }
    };
  }
};
console.log("Локальный драйвер РемонтТех (Supabase) успешно активирован!");