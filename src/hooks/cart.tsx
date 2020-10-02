import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@mtkv2:products');
      console.log(productsStorage);

      if(productsStorage) {
        setProducts([...JSON.parse(productsStorage)])
      }

    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {

     const productExist = products.find(filter => filter.id === product.id)
     let newProducts: Array<Product>;

     if (productExist) {
      newProducts = products.map(p => p.id === product.id ? {...product, quantity: p.quantity + 1 } : p )
      setProducts(newProducts );
     } else {
       newProducts  = [...products, {...product, quantity: 1}]
      setProducts(
        newProducts
      );
      console.log('else');

     }


     await AsyncStorage.setItem('@mtkv2:products', JSON.stringify(newProducts));



  }, [products]);

  const increment = useCallback(async id => {
     const newProducts =   products.map(p => p.id === id ? { ...p, quantity: p.quantity + 1 } : p )

     setProducts(newProducts);
     await AsyncStorage.setItem('@mtkv2:products', JSON.stringify(newProducts));

  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts =   products.map(p => p.id === id ? { ...p, quantity: p.quantity - 1 } : p )

    setProducts(
      newProducts
    );
    await AsyncStorage.setItem('@mtkv2:products', JSON.stringify(newProducts));

  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
