@ -46,10 +46,9 @@ export default function ProfileSetupScreen() {
  const [error, setError] = useState<string | null>(null);
  const [showPrefectureModal, setShowPrefectureModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
@ -61,6 +60,8 @@ export default function ProfileSetupScreen() {
    cover_url: '',
    interests: [] as string[],
    skills: [] as Skill[],
    age: '',
    university: '',
  });

  const handleImagePick = async (type: 'profile' | 'cover') => {
@ -88,10 +89,9 @@ export default function ProfileSetupScreen() {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        aspect: [1, 1],
        quality: 1,
        selectionLimit: 1,
        presentationStyle: Platform.OS === 'ios' ? 'automatic' : undefined,
        presentationStyle: Platform.OS === 'ios' ? ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC : undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
@ -121,7 +121,7 @@ export default function ProfileSetupScreen() {

  const toggleSkill = (skill: string) => {
    setSelectedSkill(skill);
    setShowExperienceModal(true);
    setShowExperiencePicker(true);
  };

  const addSkillWithExperience = (skill: string, years: string) => {
@ -132,8 +132,7 @@ export default function ProfileSetupScreen() {
        : [...prev.skills, { name: skill, years }]
    }));
    setSelectedSkill(null);
    setShowExperienceModal(false);
    setShowSkillsModal(false);
    setShowExperiencePicker(false);
  };

  const removeSkill = (skillName: string) => {
@ -158,21 +157,41 @@ export default function ProfileSetupScreen() {
        throw new Error('名前は必須です');
      }

      const { error: updateError } = await supabase
      // プロフィールが既に存在するか確認
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          title: profileData.title,
          location: profileData.location,
          website: profileData.website,
          bio: profileData.bio,
          image_url: profileData.image_url,
          cover_url: profileData.cover_url,
          interests: profileData.interests,
          skills: profileData.skills.map(skill => skill.name),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        .select()
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Profile fetch error:', fetchError);
        throw new Error(`プロフィールの確認に失敗しました: ${fetchError.message}`);
      }

      const profileUpdateData = {
        name: profileData.name,
        title: profileData.title,
        location: profileData.location,
        website: profileData.website,
        bio: profileData.bio,
        image_url: profileData.image_url,
        cover_url: profileData.cover_url,
        interests: profileData.interests,
        skills: profileData.skills,
        age: profileData.age,
        university: profileData.university,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = existingProfile
        ? await supabase
            .from('profiles')
            .update(profileUpdateData)
            .eq('id', user.id)
        : await supabase
            .from('profiles')
            .insert([{ ...profileUpdateData, id: user.id }]);

      if (updateError) {
        throw updateError;
@ -283,6 +302,27 @@ export default function ProfileSetupScreen() {
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>年齢</Text>
            <TextInput
              style={styles.input}
              value={profileData.age}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, age: text }))}
              placeholder="年齢を入力"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>大学名</Text>
            <TextInput
              style={styles.input}
              value={profileData.university}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, university: text }))}
              placeholder="大学名を入力"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>興味のある分野</Text>
            <TouchableOpacity
@ -315,26 +355,48 @@ export default function ProfileSetupScreen() {
          <View style={styles.inputGroup}>
            <Text style={styles.label}>スキル</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowSkillsModal(true)}>
              <Plus size={20} color="#6b7280" />
              <Text style={styles.selectButtonText}>
                {profileData.skills.length > 0
                  ? `${profileData.skills.length}個のスキルを選択中`
                  : 'スキルを選択'}
              style={styles.dropdownButton}
              onPress={() => setShowSkillsDropdown(!showSkillsDropdown)}>
              <Text style={styles.dropdownButtonText}>
                {profileData.skills.length > 0 ? `${profileData.skills.length}個選択中` : 'スキルを選択'}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {showSkillsDropdown && (
              <View style={styles.skillsDropdownContent}>
                <ScrollView>
                  <View style={styles.skillsGrid}>
                    {SKILLS.map((skill) => (
                      <TouchableOpacity
                        key={`skill-${skill}`}
                        style={[
                          styles.skillButton,
                          profileData.skills.some(s => s.name === skill) && styles.skillButtonActive,
                        ]}
                        onPress={() => toggleSkill(skill)}>
                        <Text
                          style={[
                            styles.skillButtonText,
                            profileData.skills.some(s => s.name === skill) && styles.skillButtonTextActive,
                          ]}>
                          {skill}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
            {profileData.skills.length > 0 && (
              <View style={styles.tagsContainer}>
              <View style={styles.selectedSkillsContainer}>
                {profileData.skills.map((skill) => (
                  <View key={skill.name} style={styles.tag}>
                    <Text style={styles.tagText}>
                  <View key={`selected-skill-${skill.name}`} style={styles.selectedSkillTag}>
                    <Text style={styles.selectedSkillText}>
                      {skill.name} ({skill.years})
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeSkill(skill.name)}
                      style={styles.tagRemoveButton}>
                      style={styles.selectedSkillRemoveButton}>
                      <X size={12} color="#6366f1" />
                    </TouchableOpacity>
                  </View>
@ -447,74 +509,41 @@ export default function ProfileSetupScreen() {
        </View>
      </Modal>

      {/* スキル選択モーダル */}
      <Modal
        visible={showSkillsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSkillsModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>スキルを選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSkillsModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {SKILLS.filter(skill => !profileData.skills.some(s => s.name === skill)).map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSkill(skill);
                    setShowExperienceModal(true);
                  }}>
                  <Text style={styles.modalItemText}>{skill}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Experience Picker Modal */}
      <Modal
        visible={showExperienceModal}
        visible={showExperiencePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowExperienceModal(false);
          setShowExperiencePicker(false);
          setSelectedSkill(null);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>
                {selectedSkill}の経験年数を選択
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                style={styles.pickerModalCloseButton}
                onPress={() => {
                  setShowExperienceModal(false);
                  setShowExperiencePicker(false);
                  setSelectedSkill(null);
                }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
            <ScrollView style={styles.pickerModalList}>
              {EXPERIENCE_YEARS.map((years) => (
                <TouchableOpacity
                  key={`experience-${years}`}
                  style={styles.modalItem}
                  style={styles.pickerModalItem}
                  onPress={() => {
                    if (selectedSkill) {
                      addSkillWithExperience(selectedSkill, years);
                    }
                  }}>
                  <Text style={styles.modalItemText}>{years}</Text>
                  <Text style={styles.pickerModalItemText}>{years}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
@ -794,4 +823,126 @@ const styles = StyleSheet.create({
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  skillsDropdownContent: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  skillButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  skillButtonActive: {
    backgroundColor: '#e0e7ff',
  },
  skillButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  skillButtonTextActive: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 4,
  },
  selectedSkillText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  selectedSkillRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#c7d2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  pickerModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalList: {
    padding: 20,
  },
  pickerModalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerModalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerModalItemTextSelected: {
    color: '#4f46e5',
    fontWeight: '500',
  },
});