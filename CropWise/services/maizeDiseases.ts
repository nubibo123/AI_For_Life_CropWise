// Dữ liệu về các bệnh thường gặp ở cây ngô

export interface MaizeDisease {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  causes: string[];
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export const maizeDiseases: MaizeDisease[] = [
  {
    id: 'cercospora-leaf-spot',
    name: 'Đốm lá Cercospora',
    nameEn: 'Cercospora Leaf Spot (Gray Leaf Spot)',
    image: 'https://content.peat-cloud.com/w400/grey-leaf-spot-of-maize-maize-1.jpg',
    symptoms: [
      'Các đốm nhỏ màu xám hoặc nâu xuất hiện trên lá',
      'Đốm có hình chữ nhật, song song với gân lá',
      'Lá bị khô và chết từ phía dưới lên trên',
      'Giảm khả năng quang hợp của cây',
      'Thường xuất hiện khi trời ẩm ướt'
    ],
    treatment: [
      'Phun thuốc fungicide chứa azoxystrobin hoặc pyraclostrobin',
      'Sử dụng thuốc chứa propiconazole',
      'Phun phòng ngừa khi cây cao 30-40cm',
      'Lặp lại sau 14-21 ngày nếu cần thiết',
      'Loại bỏ và tiêu hủy lá bị bệnh nặng'
    ],
    prevention: [
      'Luân canh với các cây trồng khác (đậu tương, lúa mì)',
      'Chọn giống ngô kháng bệnh',
      'Dọn sạch rơm rạ sau thu hoạch',
      'Tránh trồng quá dày, đảm bảo thông thoáng',
      'Bón phân cân đối, tránh thừa đạm',
      'Tưới nước hợp lý, tránh úng'
    ],
    causes: [
      'Nấm Cercospora zeae-maydis',
      'Điều kiện ẩm ướt kéo dài (độ ẩm > 90%)',
      'Nhiệt độ từ 22-30°C',
      'Mưa nhiều, sương mù dày',
      'Trồng ngô liên tục trên cùng một đất',
      'Bệnh lây lan qua gió và nước mưa'
    ],
    severity: 'high',
    description: 'Đốm lá Cercospora là một trong những bệnh phổ biến và nguy hiểm nhất trên cây ngô, có thể gây thiệt hại năng suất từ 30-50%.'
  },
  {
    id: 'common-rust',
    name: 'Gỉ sắt thường',
    nameEn: 'Common Rust',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYkjmhmODjdmkVFoJrzJevwugu3L-2k6j32w&s',
    symptoms: [
      'Các mụn nhỏ màu nâu đỏ (gỉ sắt) trên lá',
      'Mụn phồng lên và vỡ ra phát tán bào tử',
      'Lá bị vàng và khô dần',
      'Thường xuất hiện ở hai mặt lá',
      'Có thể lây sang thân và bắp ngô'
    ],
    treatment: [
      'Phun fungicide chứa triazole',
      'Sử dụng mancozeb hoặc chlorothalonil',
      'Phun khi mới phát hiện bệnh',
      'Lặp lại sau 7-10 ngày',
      'Phun vào buổi sáng sớm hoặc chiều mát'
    ],
    prevention: [
      'Trồng giống ngô kháng bệnh',
      'Trồng sớm để tránh thời điểm dịch bệnh',
      'Đảm bảo khoảng cách trồng hợp lý',
      'Tăng cường thông gió trong vườn',
      'Bón phân kali đầy đủ',
      'Loại bỏ cỏ dại xung quanh'
    ],
    causes: [
      'Nấm Puccinia sorghi',
      'Nhiệt độ từ 16-25°C',
      'Độ ẩm cao (trên 95%)',
      'Sương mai nhiều',
      'Gió mạnh lan truyền bào tử',
      'Cây bị stress do thiếu nước hoặc dinh dưỡng'
    ],
    severity: 'medium',
    description: 'Gỉ sắt thường là bệnh phổ biến trên ngô, đặc biệt ở vùng khí hậu mát mẻ và ẩm ướt. Nếu không kiểm soát có thể giảm 20-40% năng suất.'
  },
  {
    id: 'northern-leaf-blight',
    name: 'Cháy lá phía Bắc',
    nameEn: 'Northern Leaf Blight',
    image: 'https://guide.utcrops.com/wp-content/uploads/2023/06/Northern-Corn-Leaf-Blight-1-e1687461214618.png',
    symptoms: [
      'Các vết dài hình thoi màu xám xanh trên lá',
      'Vết bệnh có viền rõ ràng',
      'Lan rộng dọc theo gân lá',
      'Lá bị khô và chết từ dưới lên',
      'Giảm diện tích quang hợp nghiêm trọng'
    ],
    treatment: [
      'Sử dụng fungicide chứa strobilurin',
      'Phun propiconazole + azoxystrobin',
      'Bắt đầu phun khi cây 8-10 lá',
      'Phun lặp lại mỗi 14 ngày',
      'Tập trung phun vào tầng lá giữa và trên'
    ],
    prevention: [
      'Chọn giống ngô có khả năng kháng bệnh',
      'Luân canh 2-3 năm',
      'Làm sạch và chôn sâu rơm rạ sau thu hoạch',
      'Trồng với mật độ thích hợp',
      'Tránh tưới nước vào buổi tối',
      'Theo dõi và phát hiện sớm'
    ],
    causes: [
      'Nấm Exserohilum turcicum (Setosphaeria turcica)',
      'Nhiệt độ từ 18-27°C',
      'Độ ẩm cao, trên 90%',
      'Sương đêm kéo dài 6-18 giờ',
      'Bệnh tàn lưu trên rơm rạ',
      'Lan truyền qua gió và mưa bắn'
    ],
    severity: 'high',
    description: 'Cháy lá phía Bắc là bệnh nguy hiểm có thể làm giảm năng suất 30-70% nếu không được kiểm soát kịp thời, đặc biệt nghiêm trọng ở vùng có khí hậu mát và ẩm.'
  },
  {
    id: 'healthy',
    name: 'Lá khỏe mạnh',
    nameEn: 'Healthy Leaf',
    image: 'data:image/jpeg;base64,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',
    symptoms: [
      'Lá có màu xanh tươi đồng đều',
      'Không có đốm, vết hoặc biến màu',
      'Bề mặt lá nhẵn và sáng bóng',
      'Gân lá rõ ràng và khỏe',
      'Cây phát triển tốt, thân chắc'
    ],
    treatment: [
      'Không cần điều trị',
      'Duy trì chế độ chăm sóc hiện tại',
      'Theo dõi thường xuyên để phát hiện sớm bệnh',
      'Tiếp tục bón phân theo lịch',
      'Đảm bảo cây được tưới nước đầy đủ'
    ],
    prevention: [
      'Bón phân cân đối NPK',
      'Tưới nước đều đặn, tránh khô hạn',
      'Kiểm soát sâu bệnh thường xuyên',
      'Duy trì vệ sinh vườn tốt',
      'Sử dụng giống ngô chất lượng',
      'Theo dõi và loại bỏ cây bệnh sớm'
    ],
    causes: [
      'Chăm sóc đúng cách',
      'Dinh dưỡng cân đối',
      'Điều kiện thời tiết thuận lợi',
      'Giống ngô khỏe mạnh',
      'Không có dịch bệnh',
      'Quản lý tốt sâu hại'
    ],
    severity: 'low',
    description: 'Lá ngô khỏe mạnh là dấu hiệu cho thấy cây đang phát triển tốt với chế độ chăm sóc phù hợp. Cần duy trì và tiếp tục theo dõi để đảm bảo năng suất cao.'
  },
  {
    id: 'fall-armyworm',
    name: 'Sâu keo mùa thu',
    nameEn: 'Fall Armyworm',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa-i8XzV_slrYeJ7TKrq2-ngNLXIKfurH-4g&s',
    symptoms: [
      'Lỗ thủng trên lá do sâu ăn',
      'Lá bị cắn rách theo hình răng cưa',
      'Có phân sâu màu đen gần vết ăn',
      'Cây non bị ăn điểm sinh trưởng',
      'Sâu ẩn trong phễu lá non',
      'Bắp bị sâu đục vào'
    ],
    treatment: [
      'Phun thuốc sinh học Bacillus thuringiensis (Bt)',
      'Sử dụng thuốc emamectin benzoate',
      'Phun spinetoram hoặc chlorantraniliprole',
      'Phun vào buổi sáng sớm hoặc chiều tối',
      'Bắt sâu thủ công khi số lượng ít',
      'Sử dụng bẫy pheromone để giám sát'
    ],
    prevention: [
      'Theo dõi thường xuyên, phát hiện sớm',
      'Trồng ngô cùng thời điểm trong vùng',
      'Sử dụng giống ngô kháng sâu (Bt corn)',
      'Dọn sạch cỏ dại quanh vườn',
      'Trồng xen cây họ đậu để thu hút thiên địch',
      'Không trồng ngô liên tục',
      'Phát quang đất sau thu hoạch'
    ],
    causes: [
      'Sâu Spodoptera frugiperda',
      'Nhiệt độ ấm (25-28°C)',
      'Điều kiện khô hạn',
      'Trồng ngô liên tục',
      'Bay từ các vùng khác đến',
      'Thiếu thiên địch tự nhiên',
      'Cây bị stress, sức đề kháng kém'
    ],
    severity: 'high',
    description: 'Sâu keo mùa thu là một trong những loại sâu hại nguy hiểm nhất đối với cây ngô, có thể gây thiệt hại 100% năng suất nếu không được kiểm soát kịp thời, đặc biệt ở giai đoạn cây non.'
  },
  {
    id: 'stem-borer',
    name: 'Sâu đục thân',
    nameEn: 'Stem Borer',
    image: 'https://www.krishimala.com/sites/default/files/2018-07/maize%20borer1.jpg',
    symptoms: [
      'Lỗ đục trên thân cây',
      'Có phân sâu màu nâu nhạt ở lỗ đục',
      'Lá giữa bị vàng và héo',
      'Thân cây dễ gãy',
      'Cây còi cọc, sinh trưởng kém',
      'Bắp nhỏ, hạt lép'
    ],
    treatment: [
      'Phun thuốc sinh học Bt vào phễu lá',
      'Sử dụng cartap hydrochloride',
      'Phun fipronil hoặc chlorpyrifos',
      'Bơm thuốc vào thân có dấu hiệu bị đục',
      'Thu gom và tiêu hủy cây bị hại nặng',
      'Sử dụng bẫy đèn để bắt bướm đêm'
    ],
    prevention: [
      'Trồng giống ngô kháng sâu',
      'Xử lý hạt giống trước khi gieo',
      'Loại bỏ cỏ dại, nhất là cỏ lồng vực',
      'Trồng đúng thời vụ',
      'Bón phân cân đối, tăng cường kali',
      'Luân canh với cây họ đậu',
      'Phát quang gốc sau thu hoạch'
    ],
    causes: [
      'Sâu Sesamia inferens hoặc Chilo spp.',
      'Bướm đẻ trứng vào lá non',
      'Sâu non đục vào thân non',
      'Điều kiện ấm ẩm thuận lợi',
      'Trồng ngô liên tục',
      'Cỏ dại là nơi ẩn náu',
      'Thiếu thiên địch'
    ],
    severity: 'high',
    description: 'Sâu đục thân gây hại nghiêm trọng bằng cách phá hủy hệ thống dẫn truyền trong thân, có thể làm giảm 40-80% năng suất, đặc biệt nguy hiểm ở giai đoạn cây đang hình thành bắp.'
  },
  {
    id: 'downy-mildew',
    name: 'Bệnh Sương Mai',
    nameEn: 'Downy Mildew',
    image: 'https://content.peat-cloud.com/w400/downy-mildew-of-maize-maize-1600930798.jpg',
    symptoms: [
      'Vệt vàng nhạt song song với gân lá',
      'Mặt dưới lá có lớp bột trắng (bào tử nấm)',
      'Lá bị biến dạng, xoăn và dày lên',
      'Cây còi cọc, thấp lùn bất thường',
      'Bắp phát triển không bình thường hoặc không có bắp',
      'Bông đực phát triển kém hoặc biến dạng'
    ],
    treatment: [
      'Sử dụng fungicide metalaxyl hoặc mefenoxam',
      'Phun cymoxanil + mancozeb',
      'Áp dụng điều trị hạt giống trước khi gieo',
      'Phun phòng ngừa khi cây 3-4 lá',
      'Loại bỏ và tiêu hủy cây bị bệnh nặng ngay',
      'Không trồng cây từ hạt thu hoạch từ ruộng bị bệnh'
    ],
    prevention: [
      'Sử dụng giống ngô kháng bệnh',
      'Xử lý hạt giống bằng fungicide trước gieo',
      'Luân canh với cây họ đậu hoặc lúa',
      'Gieo trồng đúng thời vụ, tránh mùa mưa nhiều',
      'Không gieo quá dày, đảm bảo thoát nước tốt',
      'Loại bỏ cỏ dại làm ẩm vườn',
      'Theo dõi và phát hiện sớm'
    ],
    causes: [
      'Nấm Peronosclerospora spp.',
      'Nhiệt độ mát (20-25°C)',
      'Độ ẩm rất cao (> 95%)',
      'Sương sớm và mưa phùn kéo dài',
      'Thời tiết u ám, ít nắng',
      'Đất úng nước, thoát nước kém',
      'Hạt giống nhiễm bệnh'
    ],
    severity: 'high',
    description: 'Bệnh Sương Mai là một trong những bệnh nguy hiểm nhất của cây ngô, có thể gây thiệt hại 100% nếu xảy ra sớm. Cây bị bệnh thường không cho bắp hoặc bắp rất nhỏ, hạt lép.'
  },
  {
    id: 'mln',
    name: 'MLN - Bệnh Hoại Tử Lá Ngô',
    nameEn: 'Maize Lethal Necrosis (MLN)',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr1TASD9DG_GYU5Wq9uOElPC7DPrrMEnA-8Q&s',
    symptoms: [
      'Vệt chlorotic (vàng nhạt) ở gốc lá non',
      'Lá bị hoại tử từ mép lá vào trong',
      'Cây còi cọc nghiêm trọng',
      'Bắp phát triển kém hoặc không có hạt',
      'Cây chết sớm trước khi trổ bông',
      'Bông đực không phát triển hoặc biến dạng'
    ],
    treatment: [
      'KHÔNG CÓ thuốc điều trị trực tiếp',
      'Loại bỏ và tiêu hủy cây bị bệnh ngay lập tức',
      'Kiểm soát côn trùng truyền bệnh (rầy, bọ)',
      'Phun thuốc trừ sầu bệnh và rầy định kỳ',
      'Cách ly khu vực bị nhiễm',
      'Không di chuyển vật liệu từ vùng bệnh'
    ],
    prevention: [
      'Sử dụng giống ngô kháng MLN (rất quan trọng)',
      'Kiểm soát côn trùng truyền bệnh nghiêm ngặt',
      'Trồng xa các ruộng ngô khác',
      'Không trồng liên tục nhiều vụ',
      'Phát hiện và loại bỏ cây bệnh sớm nhất',
      'Vệ sinh công cụ sau khi tiếp xúc cây bệnh',
      'Sử dụng hạt giống được kiểm định'
    ],
    causes: [
      'Virus MCMV (Maize Chlorotic Mottle Virus)',
      'Kết hợp với Potyvirus (SCMV hoặc MDMV)',
      'Lây truyền qua côn trùng (rầy, bọ)',
      'Lây qua phấn hoa nhiễm bệnh',
      'Có thể lây qua hạt giống',
      'Thời tiết ấm và khô thuận lợi',
      'Cây stress do thiếu nước'
    ],
    severity: 'high',
    description: 'MLN (Maize Lethal Necrosis) là bệnh virus cực kỳ nguy hiểm, có thể gây mất trắng 100% năng suất. Đây là bệnh dịch cần được phát hiện và xử lý ngay lập tức. Không có thuốc chữa, chỉ có thể phòng ngừa.'
  },
  {
    id: 'msv',
    name: 'MSV - Virus Vằn Ngô',
    nameEn: 'Maize Streak Virus (MSV)',
    image: 'https://ars.els-cdn.com/content/image/3-s2.0-B9780323908993000926-f10-02-9780323908993.jpg',
    symptoms: [
      'Các vệt vàng nhạt hoặc trắng song song với gân lá',
      'Vệt có dạng chấm hoặc gạch đứt quãng',
      'Lá non bị nhiễm nặng nhất',
      'Cây còi cọc, sinh trưởng chậm',
      'Bắp nhỏ, hạt lép hoặc không có bắp',
      'Các vệt lan rộng khi cây phát triển'
    ],
    treatment: [
      'KHÔNG CÓ thuốc điều trị virus',
      'Loại bỏ cây bị bệnh nặng',
      'Kiểm soát rầy xanh (côn trùng truyền bệnh)',
      'Phun insecticide để diệt rầy',
      'Sử dụng imidacloprid hoặc thiamethoxam',
      'Phun dầu neem để đuổi rầy',
      'Cải thiện dinh dưỡng cho cây kháng chịu tốt hơn'
    ],
    prevention: [
      'Trồng giống ngô kháng MSV',
      'Gieo sớm để tránh thời điểm rầy nhiều',
      'Kiểm soát rầy xanh tích cực',
      'Loại bỏ cỏ dại là nơi rầy trú ẩn',
      'Trồng ngô cùng thời điểm trong vùng',
      'Sử dụng màng phủ bạc để đuổi rầy',
      'Bón phân cân đối để cây khỏe'
    ],
    causes: [
      'Virus MSV (Maize Streak Virus)',
      'Truyền bệnh qua rầy xanh (Cicadulina spp.)',
      'Rầy hút dịch lá cây bệnh sau đó truyền sang cây khỏe',
      'Thời tiết khô, nắng nóng thuận lợi cho rầy',
      'Cây trồng sớm dễ bị nhiễm',
      'Có nhiều cỏ dại quanh vườn',
      'Không có khả năng lây qua hạt giống'
    ],
    severity: 'high',
    description: 'MSV (Maize Streak Virus) là bệnh virus phổ biến ở châu Phi và một số vùng châu Á, có thể gây giảm năng suất 20-100% tùy thời điểm nhiễm. Cây nhiễm sớm thường mất trắng, nhiễm muộn giảm năng suất 20-50%.'
  }
];

export const getDiseaseById = (id: string): MaizeDisease | undefined => {
  return maizeDiseases.find(disease => disease.id === id);
};

export const getDiseasesBySeverity = (severity: 'low' | 'medium' | 'high'): MaizeDisease[] => {
  return maizeDiseases.filter(disease => disease.severity === severity);
};

export const searchDiseases = (query: string): MaizeDisease[] => {
  const lowerQuery = query.toLowerCase();
  return maizeDiseases.filter(disease => 
    disease.name.toLowerCase().includes(lowerQuery) ||
    disease.nameEn.toLowerCase().includes(lowerQuery) ||
    disease.description.toLowerCase().includes(lowerQuery)
  );
};
