-- プロジェクト画像用のストレージポリシーを設定
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true);

-- 認証済みユーザーがファイルをアップロードできるポリシー
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

-- 誰でもファイルを閲覧できるポリシー
CREATE POLICY "Anyone can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'projects');

-- 所有者がファイルを更新・削除できるポリシー
CREATE POLICY "Project owners can update and delete their images"
ON storage.objects FOR UPDATE OR DELETE
TO authenticated
USING (bucket_id = 'projects' AND auth.uid() = owner); 