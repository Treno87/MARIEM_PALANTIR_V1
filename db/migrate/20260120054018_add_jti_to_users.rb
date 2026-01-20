class AddJtiToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :jti, :string, null: false, default: ""
    add_index :users, :jti, unique: true

    # 기존 사용자에게 랜덤 jti 설정
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE users SET jti = gen_random_uuid()::text WHERE jti = ''
        SQL
      end
    end
  end
end
