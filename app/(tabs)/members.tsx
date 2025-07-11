import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { Search, Plus, Filter, Phone, List, Grid2x2 as Grid } from 'lucide-react-native';
import Header from '@/components/common/Header';
import MemberCard from '@/components/members/MemberCard';
import FilterModal from '@/components/members/FilterModal';
import { fetchMembers, MembersApiResponse } from '@/data/membersService';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import type { Member } from '@/data/membersService';
// import { MembersApiResponse } from '@/data/membersService'; // Remove unused type

export default function MembersScreen() {
const [members, setMembers] = useState<Member[] | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Refs to hold current state values for stable useCallback
  const currentPageRef = useRef(currentPage);
  const totalPagesRef = useRef(totalPages);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  const loadMembers = useCallback(async (pageToLoad: number = 1, appending: boolean = false) => {
    console.log(`loadMembers called - pageToLoad: ${pageToLoad}, appending: ${appending}`);
    if (appending && pageToLoad > totalPagesRef.current) {
      console.log("loadMembers: Reached end of pages or already loading more.");
      return;
    }

    if (appending) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data: MembersApiResponse = await fetchMembers(pageToLoad);
      console.log("loadMembers: API Response data:", data);
   
      setMembers(prevMembers => {
        console.log("setMembers: Previous members state:", prevMembers);
        const newMembers: Member[] = data.data || [];
        console.log("setMembers: New members from API:", newMembers);
        const combined = appending ? [...(prevMembers || []), ...newMembers] : newMembers;
        
        // De-duplicate members based on ID to prevent 'encountered two children with same key'
        const uniqueMembers = Array.from(new Map(combined.map((member: Member) => [member.id, member])).values());
        console.log("setMembers: Unique combined members:", uniqueMembers);
        return uniqueMembers;
      });
      setTotalPages(data.meta?.totalPages);
      setCurrentPage(data.meta?.page);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      console.log("loadMembers completed. isLoading:", isLoading, "isFetchingMore:", isFetchingMore);
    }
  }, []); // Empty dependency array, relies on refs for currentPage and totalPages

  // Initial load or when search/filter changes
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1); // Reset page to 1 for new search/filter
      loadMembers(1, false);
    }, [loadMembers])
  );

  useEffect(() => {
    console.log("Filtering useEffect triggered. Current members state:", members, "Search Query:", searchQuery, "Filter Status:", filterStatus);
    let result: Member[] = members ?? [];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      
      result = result.filter(member => member.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMembers(result);
  }, [members, searchQuery, filterStatus]);

  const handleFilterApply = (status: string) => {
    setFilterStatus(status);
    setFilterModalVisible(false);
  };

  const handleAddMember = () => {
    router.push('/members/add');
  };

  return (
    isLoading ? (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <Header title="Members" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    ) : (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <Header title="Members" />
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.totalMembers}>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[
                styles.viewModeButton, 
                viewMode === 'list' && styles.activeViewMode
              ]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? COLORS.primary : COLORS.darkGray} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.viewModeButton, 
                viewMode === 'grid' && styles.activeViewMode
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={20} color={viewMode === 'grid' ? COLORS.primary : COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MemberCard 
              member={{ ...item, join_date: item?.join_date, photo: item?.photo || null }}
              onPress={() => router.push(`/members/${item.id}`)}
              viewMode={viewMode as 'grid' | 'list'}
            />
          )}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode === 'grid' ? 'grid' : 'list'}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!isLoading && !isFetchingMore && currentPageRef.current < totalPagesRef.current) {
              loadMembers(currentPageRef.current + 1, true);
            }
          }}
          onEndReachedThreshold={1} // Trigger when 50% of the list is visible
          ListFooterComponent={() => (
            isFetchingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Loading more members...</Text>
              </View>
            ) : null
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          }
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMember}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
        <FilterModal 
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterApply}
          currentFilter={filterStatus}
        />
      </SafeAreaView>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    ...SIZES.shadow,
  },
  searchInput: {
    flex: 1,
    ...FONTS.body3,
    marginLeft: 8,
    color: COLORS.black,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    ...SIZES.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  totalMembers: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  headerActions: {
    flexDirection: 'row',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginLeft: 8,
  },
  activeViewMode: {
    backgroundColor: COLORS.primaryLight,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SIZES.shadow,
  },
});