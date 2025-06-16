import { useState, useEffect } from 'react';
import { WishlistState } from '../types/curation';
import { LikedProductsService } from '../services/likedProductsService';
import { UnifiedProduct } from '../services/combinedSearch';

export const useWishlist = (projectId: string) => {
  const [wishlistState, setWishlistState] = useState<WishlistState>({
    wishlist: [],
    isLoading: false
  });

  // Load liked products status when component mounts
  useEffect(() => {
    if (projectId) {
      loadLikedProductsStatus();
    }
  }, [projectId]);

  const loadLikedProductsStatus = async () => {
    if (!projectId) return;

    try {
      setWishlistState(prev => ({ ...prev, isLoading: true }));
      const likedProducts = await LikedProductsService.getLikedProductsForProject(projectId);
      const likedAsins = likedProducts.map(product => product.asin);
      setWishlistState({
        wishlist: likedAsins,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading liked products status:', error);
      setWishlistState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const toggleWishlist = async (product: UnifiedProduct) => {
    if (!projectId) return;

    try {
      const isCurrentlyLiked = wishlistState.wishlist.includes(product.id);

      if (isCurrentlyLiked) {
        // Unlike the product
        await LikedProductsService.unlikeProduct(projectId, product.id);
        setWishlistState(prev => ({
          ...prev,
          wishlist: prev.wishlist.filter(id => id !== product.id)
        }));
        console.log('Product unliked:', product.title);
      } else {
        // Like the product
        await LikedProductsService.likeProduct(projectId, product);
        setWishlistState(prev => ({
          ...prev,
          wishlist: [...prev.wishlist, product.id]
        }));
        console.log('Product liked:', product.title);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Optionally show a toast notification here
    }
  };

  return {
    wishlist: wishlistState.wishlist,
    isLoadingWishlist: wishlistState.isLoading,
    toggleWishlist,
    loadLikedProductsStatus
  };
};